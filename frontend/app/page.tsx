"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Music, Mic2, Wand2, Loader2, Tag, Clock } from "lucide-react";

// ==========================================
// 🎯 ACE-Step 官方推荐有效标签库 
// ==========================================
const PRESET_TAGS = {
  genres: [
    { label: "流行 Pop", value: "pop" },
    { label: "摇滚 Rock", value: "rock" },
    { label: "民谣 Folk", value: "folk" },
    { label: "电子 Electronic", value: "electronic" },
    { label: "说唱 Rap", value: "hip-hop, rap" },
    { label: "R&B", value: "r&b" },
    { label: "抒情 Ballad", value: "ballad" },
    { label: "赛博朋克", value: "synthwave, cyberpunk" },
    { label: "二次元 J-Pop", value: "j-pop, anime" },
  ],
  instruments_vibes: [
    { label: "木吉他 Acoustic", value: "acoustic guitar" },
    { label: "钢琴独奏 Piano", value: "piano" },
    { label: "重低音 Bass", value: "heavy bass" },
    { label: "弦乐 Strings", value: "strings" },
    { label: "欢快节奏", value: "upbeat, energetic, 120 bpm" },
    { label: "伤���深情", value: "sad, emotional, slow" },
    { label: "宏大史诗", value: "epic, orchestral, cinematic" },
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
    setIsGeneratingLyrics(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:8000/api/generate-lyrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: lyricTopic }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.detail || "作词失败");
      setLyrics(data.lyrics);
    } catch (err: any) {
      setError(err.message || "获取歌词失败");
    } finally {
      setIsGeneratingLyrics(false);
    }
  };

  const handleGenerateMusic = async () => {
    if (!stylePrompt.trim() && !lyrics.trim()) return;
    setIsGeneratingMusic(true);
    setError(null);
    setAudioSrc(null);

    try {
      const res = await fetch("http://localhost:8000/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: stylePrompt, lyrics, duration }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "生成失败");
      setAudioSrc(data.audio_base64);
    } catch (err: any) {
      setError(err.message || "网络请求失败");
    } finally {
      setIsGeneratingMusic(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 text-slate-800 flex flex-col items-center p-4 sm:p-8 relative overflow-x-hidden">
      <div className="absolute top-0 left-0 w-full h-96 bg-indigo-200/30 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-5xl flex flex-col gap-8"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full h-48 sm:h-64 lg:h-72 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-200/50 relative"
        >
          <img 
            src="https://images.unsplash.com/photo-1614149162883-504ce4d13909?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
            alt="Music Art" 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-wide mb-2">
              灵感音乐生成引擎
            </h1>
            <p className="text-indigo-100 font-medium tracking-wide">
              AI 智能作词 × 录音室级编曲演唱
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-stretch">
          <div className="flex flex-col gap-6">
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white shadow-lg flex-shrink-0">
              <div className="flex items-center gap-2 mb-4 text-purple-600 font-bold text-lg">
                <Wand2 className="w-5 h-5" /> 智能作词助手
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={lyricTopic}
                  onChange={(e) => setLyricTopic(e.target.value)}
                  placeholder="想写关于什么的歌？例如：夏日晚风..."
                  className="flex-1 bg-white/90 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50 shadow-sm border border-slate-100"
                />
                <button
                  onClick={handleAutoLyrics}
                  disabled={isGeneratingLyrics || !lyricTopic.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 whitespace-nowrap shadow-md shadow-purple-200"
                >
                  {isGeneratingLyrics ? <Loader2 className="w-5 h-5 animate-spin" /> : "一键作词"}
                </button>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white shadow-lg flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-4 text-indigo-600 font-bold text-lg">
                <Music className="w-5 h-5" /> 编曲与风格标签
              </div>
              <textarea
                value={stylePrompt}
                onChange={(e) => setStylePrompt(e.target.value)}
                placeholder="点击下方标签组合你的专属曲风 (如 pop, male vocals)..."
                className="w-full flex-1 min-h-[100px] bg-white/90 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/50 resize-none shadow-sm border border-slate-100 mb-4"
              />
              
              <div className="w-full mb-4 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2 text-indigo-800 font-medium text-sm">
                    <Clock className="w-4 h-4" />
                    歌曲时长设定
                  </div>
                  <span className="text-indigo-600 font-bold">{duration} 秒</span>
                </div>
                <input 
                  type="range" 
                  min="15" 
                  max="300"
                  step="15"
                  value={duration} 
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>15s (片段)</span>
                  <span>180s (普通)</span>
                  <span>300s (完整大作)</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-auto h-48 overflow-y-auto pr-2 custom-scrollbar">
                <div>
                  <div className="flex items-center text-xs text-slate-500 font-bold mb-1">🔥 热门流派</div>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_TAGS.genres.map((tag) => (
                      <button key={tag.label} onClick={() => handleAddTag(tag.value)} className="px-2.5 py-1 text-[11px] font-medium bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 hover:scale-105 active:scale-95 transition-all border border-blue-100/50">
                        {tag.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center text-xs text-slate-500 font-bold mb-1">🎸 乐器与氛围</div>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_TAGS.instruments_vibes.map((tag) => (
                      <button key={tag.label} onClick={() => handleAddTag(tag.value)} className="px-2.5 py-1 text-[11px] font-medium bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 hover:scale-105 active:scale-95 transition-all border border-emerald-100/50">
                        {tag.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center text-xs text-slate-500 font-bold mb-1">🎤 人声特征</div>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_TAGS.vocals.map((tag) => (
                      <button key={tag.label} onClick={() => handleAddTag(tag.value)} className="px-2.5 py-1 text-[11px] font-medium bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 hover:scale-105 active:scale-95 transition-all border border-rose-100/50">
                        {tag.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
              `}</style>
              
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white shadow-lg flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-slate-700 font-bold text-lg">
                <Mic2 className="w-5 h-5" /> 歌词工作台
              </div>
              <span className="text-xs text-slate-400 font-medium px-3 py-1 bg-slate-100 rounded-full">
                支持 [Verse] [Chorus] 标记
              </span>
            </div>
            <textarea
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder="等待灵感注入歌词，或在此处手动创作..."
              className="w-full flex-1 h-full min-h-[300px] bg-white/90 rounded-2xl p-5 text-sm leading-relaxed text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-400/50 resize-none shadow-sm border border-slate-100"
            />
          </div>
        </div>

        <div className="flex flex-col items-center w-full mt-4 pb-12">
          <button
            onClick={handleGenerateMusic}
            disabled={isGeneratingMusic || (!stylePrompt.trim() && !lyrics.trim())}
            className="w-full sm:w-auto px-16 py-5 rounded-full bg-gradient-to-r from-slate-800 to-slate-950 text-white font-bold text-lg tracking-wide shadow-xl shadow-slate-300/50 disabled:opacity-50 hover:scale-105 hover:shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 group border border-slate-700"
          >
            {isGeneratingMusic ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                正在录制单曲 (生成 {duration} 秒音乐较耗时，请耐心等待)...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6 text-indigo-400 group-hover:scale-125 transition-transform duration-300" />
                制作并演唱这首歌
              </>
            )}
          </button>

          <AnimatePresence>
            {error && (
              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-500 mt-6 bg-red-50 px-6 py-3 rounded-xl border border-red-100 font-medium">
                {error}
              </motion.p>
            )}

            {audioSrc && !isGeneratingMusic && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl mt-8">
                <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl shadow-indigo-100 border border-white flex flex-col items-center">
                  <p className="text-sm font-bold text-slate-500 mb-4 tracking-widest uppercase">GENERATED TRACK</p>
                  <audio 
                    controls 
                    autoPlay 
                    src={audioSrc} 
                    className="w-full h-14 outline-none rounded-full shadow-inner bg-slate-50" 
                  >
                    您的浏览器不支持音频播放元素。
                  </audio>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}