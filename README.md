# 🎵 灵感音乐生成引擎 (AI Music Engine)

基于 **DeepSeek-V3** 智能作词与 **ACE-Step** 录音室级音乐大模型打造的本地全栈 AI 音乐生成平台。只需输入一个灵感主题，即可一键生成专业级词曲并完成演唱。

## ✨ 核心特性
- **🧠 智能作词助手**：接入 DeepSeek 大模型，一键生成带结构标记（[Verse], [Chorus]）的专业歌词。
- **🎸 海量曲风预设**：内置流行、摇滚、赛博朋克、古风等数十种专业音乐风格与人声标签，点击即可组合。
- **⏱️ 灵活时长控制**：支持生成 15秒（高潮片段） 到 300秒（完整大作） 的原生音频。
- **💻 极客风 UI 设计**：基于 Next.js + Tailwind CSS 打造的丝滑动画响应式界面。

---

## 🚀 本地快速部署指南

本项目采用前后端分离架构。所有的第三方库依赖都已写在配置文件中，支持一键下载。

### 1. 💻 基础环境准备 (Windows & Linux)

你只需确保电脑上安装了三大基础核心：**Git**、**Python (3.9+)** 和 **Node.js (18+)**。请打开终端根据你的系统运行以下命令：

#### 🪟 Windows (使用自带的 winget)
右键以管理员身份打开 PowerShell，依次运行：
```powershell
winget install --id Git.Git -e --source winget
winget install --id Python.Python.3.11 -e --source winget
winget install --id OpenJS.NodeJS.LTS -e --source winget
```
 
#### 🐧 Linux (Ubuntu / Debian / WSL)
打开终端，依次运行：
```bash
sudo apt update
sudo apt install git python3 python3-pip python3-venv curl -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```
✅ 验证环境： 输入 git --version、python --version (或 python3 --version)、node -v。成功输出版本号即可进入下一步。

### 2. 📥 克隆项目
打开终端，拉取代码并进入目录：
```bash
git clone https://github.com/boolzzz/ai-music-engine.git
cd ai-music-engine
```

### 3. 🔑 配置 Gitee API 秘钥 
本项目依赖 Gitee AI 提供的底层算力。Gitee 对实名认证用户提供每天 100 次的免费调用额度。

前往 Gitee AI 官网 注册/登录并完成实名认证。
进入控制台获取你的 Serverless API Key。
在项目根目录下，新建一个名为 .env 的文件，将秘钥写入：
GITEE_API_KEY=在这里填入你获取到的真实秘钥
⚠️ 安全警告：.env 文件已被 .gitignore 忽略，绝对不要将其强制上传到 GitHub，以免秘钥泄露导致额度被盗刷！

### 4. ⚙️ 启动后端引擎 (Python FastAPI)
在终端中，依次运行以下命令：
#### 1. 创建虚拟环境 (隔离依赖)
Windows: 
```powershell
python -m venv venv
```
Linux: 
```bash
python3 -m venv venv
```

#### 2. 激活虚拟环境
Windows: 
```powershell
.\venv\Scripts\activate 
```
Linux:
```bash
source venv/bin/activate
```

#### 3. 自动安装后端所有依赖包
```bash
pip install -r requirements.txt
```

#### 4. 启动服务
```bash
uvicorn main:app --reload
```
出现 Application startup complete. 提示说明后端已运行在 http://localhost:8000。请保持该终端窗口不要关闭。

#### 5. 🎨 启动前端界面 (Next.js)
新建一个终端标签页，依次运行：
##### 1. 进入前端目录
```bash
cd frontend
```

##### 2. 自动安装前端依赖 
```bash
npm install
```

##### 3. 启动前端服务
```bash
npm run dev
```
打开浏览器，访问 http://localhost:3000 开始创作！

