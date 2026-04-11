"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Wand2, Music, Mic2, Clock, Sparkles, Play, Pause, Disc } from "lucide-react";

// ==========================================
// 🎯 ACE-Step 官方推荐有效标签库
// ==========================================
const PRESET_TAGS = {
  genres: [
    { label: "流行", value: "pop" },
    { label: "摇滚", value: "rock" },
    { label: "民谣", value: "folk" },
    { label: "电子", value: "electronic" },
    { label: "说唱", value: "hip-hop, rap" },
    { label: "节奏蓝调", value: "r&b" },
    { label: "抒情", value: "ballad" },
    { label: "赛博朋克", value: "synthwave, cyberpunk" },
    { label: "二次元 ", value: "j-pop, anime" },
    { label: "古风", value: "traditional chinese, c-pop" },
  ],
  instruments_vibes: [
    { label: "木吉他", value: "acoustic guitar" },
    { label: "钢琴独奏", value: "piano" },
    { label: "重低音", value: "heavy bass" },
    { label: "弦乐", value: "strings" },
    { label: "欢快节奏", value: "upbeat, energetic, 120 bpm" },
    { label: "伤感深情", value: "sad, emotional, slow" },
    { label: "宏大史诗", value: "epic, orchestral, cinematic" },
    { label: "传统民乐(筝/笛/二胡)", value: "guzheng, bamboo flute, erhu, pentatonic scale" },
  ],
  vocals: [
    { label: "女声", value: "female vocals" },
    { label: "男声", value: "male vocals" },
    { label: "高音质/精调", value: "high quality, polished vocals, master" },
    { label: "情感充沛", value: "emotional vocals" },
    { label: "清澈嗓音", value: "clear vocals" },
    { label: "纯伴奏(无录音)", value: "instrumental" },
  ]
};

// ==========================================
// 🎵 定制高级音频播放器组件
// ==========================================
const CustomAudioPlayer = ({ src }: { src: string }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (audioRef.current?.paused) {
      audioRef.current.play(); setIsPlaying(true);
    } else {
      audioRef.current?.pause(); setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current?.currentTime || 0);
    setDuration(audioRef.current?.duration || 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full bg-white/70 backdrop-blur-2xl border border-white p-5 rounded-3xl shadow-[0_15px_40px_rgb(0,0,0,0.08)] flex flex-col gap-4 transition-all">
      <audio ref={audioRef} src={src} autoPlay onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleTimeUpdate} onEnded={() => setIsPlaying(false)} />
      
      <div className="flex items-center gap-4">
        {/* 旋转光盘动画 */}
        <motion.div animate={{ rotate: isPlaying ? 360 : 0 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-400 flex items-center justify-center shadow-lg border-[3px] border-white">
          <Disc className="w-6 h-6 text-white drop-shadow-md" />
        </motion.div>
        
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-[15px] font-bold text-slate-800 tracking-wide mb-0.5">AI 灵感原创曲目</div>
          <div className="text-xs text-indigo-500 font-semibold tracking-wider uppercase">Original Track</div>
        </div>

        {/* 播放暂停按钮 */}
        <button onClick={togglePlay} className="w-12 h-12 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-sm border border-indigo-100">
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
        </button>
      </div>

      {/* 大而丝滑的进度条 */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-slate-500 font-medium w-8 text-right">{formatTime(currentTime)}</span>
        <input 
          type="range" 
          min="0" max={duration || 100} value={currentTime} onChange={handleSeek}
          className="flex-1 h-2.5 bg-indigo-100/80 rounded-full appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all shadow-inner"
        />
        <span className="text-xs font-mono text-slate-500 font-medium w-8">{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default function Home() {
  const [stylePrompt, setStylePrompt] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [lyricTopic, setLyricTopic] = useState("");
  const [duration, setDuration] = useState(60); 
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const [isGeneratingLyrics, setIsGeneratingLyrics] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAddTag = (tagValue: string) => {
    setStylePrompt((prev) => prev.includes(tagValue) ? prev : prev ? `${prev}, ${tagValue}` : tagValue);
  };

  const handleAutoLyrics = async () => {
    if (!lyricTopic.trim()) return;
    setIsGeneratingLyrics(true); setError(null);
    try {
      const res = await fetch("http://localhost:8000/api/generate-lyrics", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: lyricTopic }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "作词失败");
      setLyrics(data.lyrics);
    } catch (err: any) { setError(err.message || "获取歌词失败"); } finally { setIsGeneratingLyrics(false); }
  };

  const handleGenerateMusic = async () => {
    if (!stylePrompt.trim() && !lyrics.trim()) return;
    setIsGeneratingMusic(true); setError(null); setAudioSrc(null);
    try {
      const res = await fetch("http://localhost:8000/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: stylePrompt, lyrics, duration }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "生成失败");
      setAudioSrc(data.audio_base64);
    } catch (err: any) { setError(err.message || "网络请求失败"); } finally { setIsGeneratingMusic(false); }
  };

  return (
    <div className="w-full h-screen flex flex-col relative overflow-hidden bg-slate-50 selection:bg-indigo-200">
      
      {/* 动态漂浮音符点缀背景 */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div animate={{ y: [0, -30, 0], rotate: [0, 10, -10, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[15%] left-[5%] text-indigo-400/10">
          <Music size={160} />
        </motion.div>
        <motion.div animate={{ y: [0, 40, 0], rotate: [0, -15, 10, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute bottom-[20%] right-[3%] text-purple-400/10">
          <Disc size={200} />
        </motion.div>
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity }} className="absolute -top-[10%] right-[20%] w-[30%] h-[30%] bg-indigo-300/30 rounded-full blur-[100px]" />
      </div>

      <header className="h-16 flex items-center px-8 bg-white/40 backdrop-blur-md border-b border-white/50 shadow-sm relative z-10">
        <div className="flex items-center gap-3 text-lg font-extrabold tracking-wide text-indigo-900">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg"><Music className="w-4 h-4 text-white" /></div>
          灵感音乐工作台
        </div>
        <span className="ml-auto text-xs font-semibold text-indigo-600/60 tracking-widest uppercase">AI AUDIO STUDIO</span>
      </header>

      <main className="flex-1 grid grid-cols-[340px_390px_1fr] gap-6 p-6 max-w-[1500px] w-full mx-auto relative z-10 min-h-0">
        
        {/* 左侧：作词与参数 */}
        <section className="rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] bg-white/60 backdrop-blur-xl border border-white/80 flex flex-col gap-6">
          <div className="bg-white/50 p-4 rounded-2xl shadow-sm border border-white/50">
            <div className="flex gap-2 items-center mb-3 font-bold text-indigo-600 text-sm"><Wand2 className="w-4 h-4" />灵感作词</div>
            <div className="flex gap-2">
              <input type="text" value={lyricTopic} onChange={e => setLyricTopic(e.target.value)} placeholder="输入主题：如 晚风" className="flex-1 px-4 py-2 bg-white/80 border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-300 outline-none text-sm shadow-inner" />
              <button onClick={handleAutoLyrics} disabled={isGeneratingLyrics || !lyricTopic.trim()} className="px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center transition disabled:opacity-50 active:scale-95 shadow-md text-sm">
                {isGeneratingLyrics ? <Loader2 className="w-4 h-4 animate-spin" /> : "生成"}
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex gap-2 items-center mb-3 font-bold text-sky-600 text-sm"><Music className="w-4 h-4" />风格与参数设定</div>
            <textarea value={stylePrompt} onChange={e => setStylePrompt(e.target.value)} placeholder="点击下方标签组合..." className="w-full h-20 resize-none text-[13px] px-4 py-3 border border-sky-100 rounded-2xl bg-white/80 focus:ring-2 focus:ring-sky-200 outline-none mb-3 shadow-inner" />
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
              {[ { title: "流派 Genres", data: PRESET_TAGS.genres, color: "text-indigo-600", bg: "bg-indigo-50/80 hover:bg-indigo-100 border-indigo-100" },
                 { title: "乐器 Instruments", data: PRESET_TAGS.instruments_vibes, color: "text-sky-600", bg: "bg-sky-50/80 hover:bg-sky-100 border-sky-100" },
                 { title: "人声 Vocals", data: PRESET_TAGS.vocals, color: "text-purple-600", bg: "bg-purple-50/80 hover:bg-purple-100 border-purple-100" }
              ].map((cat, i) => (
                <div key={i}>
                  <div className="mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">{cat.title}</div>
                  <div className="flex flex-wrap gap-2">
                    {cat.data.map(tag => (
                      <button key={tag.label} onClick={() => handleAddTag(tag.value)} className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border shadow-sm transition active:scale-95 ${cat.color} ${cat.bg}`}>{tag.label}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-indigo-800 font-bold text-sm"><Clock className="w-4 h-4" />歌曲时长</div>
              <span className="text-indigo-600 font-bold text-xs bg-white px-2 py-0.5 rounded shadow-sm">{duration}s</span>
            </div>
            <input type="range" min="15" max="300" step="15" value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full accent-indigo-500 h-1.5 bg-indigo-200 rounded-full appearance-none cursor-pointer" />
          </div>
        </section>

        {/* 中间：修长精致的歌词本 */}
        <section className="rounded-[2rem] p-1 bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col min-h-0 relative">
          <div className="absolute top-4 left-6 flex items-center gap-2 text-slate-400 font-bold text-xs tracking-widest uppercase pointer-events-none">
            <Mic2 className="w-4 h-4 text-pink-400" /> Lyrics Sheet
          </div>
          <textarea
            value={lyrics}
            onChange={e => setLyrics(e.target.value)}
            placeholder="[Verse 1]&#10;写下你的第一句歌词吧...&#10;&#10;[Chorus]&#10;让 AI 倾听你的声音..."
            className="flex-1 w-full bg-transparent pt-14 px-8 pb-8 resize-none text-center font-medium tracking-wide text-slate-700 text-[15px] sm:text-[16px] leading-[2.5] outline-none placeholder:text-slate-400 custom-scrollbar"
          />
        </section>

        {/* 右侧：生成引擎与播放区 */}
        <section className="flex flex-col min-h-0 gap-4">
          
          {/* 🌟 修改点：这里加入了唯美的音乐图片背景和柔和毛玻璃遮罩 */}
          <div className="rounded-[2rem] flex-1 p-6 border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex justify-center items-center relative overflow-hidden bg-indigo-50/30">
            
            {/* 音乐图片背景，缓慢呼吸放大增加质感 */}
            <motion.div 
              animate={{ scale: [1, 1.05, 1] }} 
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-luminosity grayscale-[30%]"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1614149162883-504ce4d13909?q=80&w=1000&auto=format&fit=crop')" }} 
            />
            {/* 玻璃态渐变遮罩，确保文字和播放器清晰可见且不晃眼 */}
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-white/70 via-white/50 to-white/80 backdrop-blur-[6px]" />

            {/* 核心内容必须用 z-10 悬浮在背景上面 */}
            <div className="relative z-10 w-full flex flex-col items-center justify-center">
              <AnimatePresence>
                {isGeneratingMusic && (
                  <motion.div key="anim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-20 flex flex-col justify-center items-center bg-white/60 backdrop-blur-md rounded-3xl">
                    <div className="relative flex justify-center items-center mb-8">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} className="absolute w-24 h-24 rounded-full border-2 border-dashed border-indigo-500/50" />
                      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                    </div>
                    <motion.div className="flex gap-1.5 items-end mb-6 h-10">
                      {[...Array(7)].map((_, i) => (
                        <motion.div key={i} animate={{ height: ["20%", "100%", "30%"] }} transition={{ duration: 0.6 + Math.random() * 0.5, repeat: Infinity, ease: "easeInOut" }} className="w-1.5 rounded-full bg-gradient-to-t from-indigo-500 to-purple-500" />
                      ))}
                    </motion.div>
                    <div className="px-6 py-2 rounded-full text-sm font-bold bg-indigo-600 text-white shadow-lg tracking-widest">AI 音轨混合中...</div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {audioSrc && !isGeneratingMusic && (
                <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="w-full">
                  <CustomAudioPlayer src={audioSrc} />
                </motion.div>
              )}

              {!isGeneratingMusic && !audioSrc && (
                <div className="flex flex-col items-center opacity-50 pointer-events-none drop-shadow-md">
                  <Disc className="w-20 h-20 text-indigo-800 mb-3" />
                  <div className="text-center text-indigo-900 font-bold tracking-widest text-sm uppercase">Engine Standby</div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-5 rounded-3xl shadow-sm">
            <button
              onClick={handleGenerateMusic}
              disabled={isGeneratingMusic || (!stylePrompt.trim() && !lyrics.trim())}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] hover:bg-[position:right_center] text-white font-extrabold text-lg shadow-xl shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-500 flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
            >
              <Sparkles className="w-6 h-6 text-indigo-200" />
              铸造音乐灵魂
            </button>
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: 10, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 bg-red-50 text-red-600 p-3 rounded-xl text-center font-medium text-sm border border-red-100">
                  ⚠️ {error}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99, 102, 241, 0.4); }
        input[type=range] { -webkit-appearance: none; background: transparent; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 16px; width: 16px; border-radius: 50%; background: #6366f1; cursor: pointer; margin-top: -3px; box-shadow: 0 0 10px rgba(99,102,241,0.5); }
        input[type=range]::-webkit-slider-runnable-track { width: 100%; height: 10px; cursor: pointer; background: rgba(224, 231, 255, 0.8); border-radius: 10px; }
      `}</style>
    </div>
  );
}