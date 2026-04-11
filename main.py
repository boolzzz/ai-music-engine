from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="灵感音乐引擎 API (AI作词+编曲全自动版)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_TOKEN = os.getenv("GITEE_API_KEY", "")
headers = {
    "Authorization": f"Bearer {API_TOKEN}",
    "Content-Type": "application/json"
}

# --- 数据模型 ---
class MusicRequest(BaseModel):
    prompt: str = ""
    lyrics: str = ""

class LyricRequest(BaseModel):
    topic: str = ""

class MusicRequest(BaseModel):
    prompt: str = ""
    lyrics: str = ""
    duration: int = 300  

# =====================================================================
# 🧠 新增功能：大语言模型（DeepSeek-V3）自动作词接口
# =====================================================================
@app.post("/api/generate-lyrics")
async def generate_lyrics(req: LyricRequest):
    if not API_TOKEN:
        raise HTTPException(status_code=500, detail="未配置 GITEE_API_KEY")
    if not req.topic.strip():
        raise HTTPException(status_code=400, detail="请输入歌曲主题")

    # Gitee 的大模型通用聊天接口
    llm_url = "https://ai.gitee.com/v1/chat/completions"
    
    # 给 AI 设定人设（提示词工程）
    system_prompt = """你是一个顶级的流行音乐金牌作词人。
    请根据用户提供的主题，创作一首适合AI生成的中文歌词。
    要求：
    1. 必须包含标准的结构标记，如 [Verse] (主歌)、[Chorus] (副歌)、[Bridge] (桥段) 等。
    2. 歌词要有意境，押韵自然，情感充沛。
    3. 篇幅不要太长，适合 1 分钟左右的演唱（约 4-6 段）。
    4. 【重要】只输出歌词本身，绝对不要输出任何多余的解释、废话或标题！"""

    payload = {
        "model": "DeepSeek-V3", 
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"请为我写一首歌，主题/要求是：{req.topic}"}
        ]
    }

    try:
        print(f"✍️ 正在呼叫 DeepSeek 创作歌词，主题: {req.topic}")
        res = requests.post(llm_url, headers=headers, json=payload, timeout=30)
        if res.status_code != 200:
            raise HTTPException(status_code=502, detail=f"大模型调用失败: {res.text}")
            
        data = res.json()
        if "choices" in data:
            lyrics = data["choices"][0]["message"]["content"].strip()
            print("✅ 歌词创作完成！")
            return {"success": True, "lyrics": lyrics}
        else:
            raise HTTPException(status_code=500, detail="大模型返回格式异常")
    except Exception as e:
        print(f"❌ 歌词生成错误: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# =====================================================================
# 🎵 原有的音乐生成接口 (ACE-Step)
# =====================================================================
@app.post("/api/generate")
async def generate_music(req: MusicRequest):
    print(f"📥 收到前端数据 -> 风格: '{req.prompt}' | 歌词片段: '{req.lyrics[:15]}...'")
    
    if not req.prompt.strip() and not req.lyrics.strip():
        raise HTTPException(status_code=400, detail="风格和歌词不能都为空")
    if not API_TOKEN:
        raise HTTPException(status_code=500, detail="未配置 GITEE_API_KEY")

    final_prompt = req.prompt.strip() if req.prompt.strip() else "pop, high quality"
    final_lyrics = req.lyrics.strip() if req.lyrics.strip() else "[Verse]\n啦啦啦~ 啦啦啦~"

    payload = {
        "prompt": final_prompt,
        "lyrics": final_lyrics,
        "model": "ACE-Step-v1-3.5B",
        "duration": req.duration,
        "use_erg_tag": True,
        "use_erg_lyric": True,
    }

    try:
        print("🚀 正在提交任务给 ACE-Step...")
        response = requests.post("https://ai.gitee.com/v1/async/music/generations", headers=headers, json=payload)
        
        if response.status_code != 200:
            raise HTTPException(status_code=502, detail=f"提交失败: {response.text}")
            
        task_id = response.json().get("task_id")
        if not task_id:
            raise HTTPException(status_code=500, detail="未能获取 Task ID")
            
        status_url = f"https://ai.gitee.com/v1/task/{task_id}"
        
        for attempt in range(60):
            print(f"⏳ 进度检查 [{attempt + 1}/60]...")
            status_data = requests.get(status_url, headers=headers).json()
            
            if status_data.get("error"):
                raise HTTPException(status_code=500, detail=status_data.get("message", "报错"))
                
            status = status_data.get("status", "unknown")
            if status == "success":
                file_url = status_data["output"]["file_url"]
                print(f"✅ 生成成功！音乐地址: {file_url}")
                return {"success": True, "audio_base64": file_url}
            elif status in ["failed", "cancelled"]:
                raise HTTPException(status_code=500, detail=f"任务失败: {status}")
            
            await asyncio.sleep(3)

        raise HTTPException(status_code=504, detail="生成超时")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)