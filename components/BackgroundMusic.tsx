
import React, { useState, useEffect, useRef } from 'react';
import { Music, Volume2, VolumeX } from 'lucide-react';

const BackgroundMusic: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // رابط موسيقى هادئة ومريحة للأعصاب (كمان وبيانو) - Royalty Free
  // Music: "Sad Trio" by Kevin MacLeod (incompetech.com) or similar vibe
  // Here using a direct reliable mixkit link for "Melancholy" vibe similar to Min Wahi El Lami
  const MUSIC_URL = "https://assets.mixkit.co/music/preview/mixkit-sad-violin-and-piano-cinematic-2303.mp3";

  useEffect(() => {
    // محاولة التشغيل عند فتح الموقع
    const attemptPlay = async () => {
      if (audioRef.current) {
        try {
          audioRef.current.volume = 0.3; // صوت منخفض ومريح (30%)
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (error) {
          console.log("Autoplay prevented. Waiting for interaction.");
          // إذا فشل التشغيل التلقائي، ننتظر أول تفاعل
        }
      }
    };

    attemptPlay();

    // مستمع لحدث "النقر" في أي مكان في الصفحة لتشغيل الصوت إذا كان متوقفاً
    const handleInteraction = () => {
      if (!hasInteracted && audioRef.current && audioRef.current.paused) {
        audioRef.current.play().then(() => {
            setIsPlaying(true);
            setHasInteracted(true);
        }).catch(e => console.error(e));
      }
    };

    document.addEventListener('click', handleInteraction);
    return () => document.removeEventListener('click', handleInteraction);
  }, [hasInteracted]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-[140] flex items-center gap-2">
      <audio ref={audioRef} src={MUSIC_URL} loop />
      
      <div className={`flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 p-2 rounded-full shadow-lg transition-all duration-300 ${isPlaying ? 'w-auto px-4' : 'w-10 h-10 justify-center'}`}>
        
        {/* Play/Pause Button */}
        <button 
            onClick={togglePlay}
            className={`text-teal-400 hover:text-white transition-colors ${isPlaying ? 'animate-pulse-slow' : ''}`}
        >
            <Music size={20} className={isPlaying ? "animate-spin-slow" : ""} />
        </button>

        {/* Volume Controls (Only visible when playing) */}
        {isPlaying && (
            <div className="flex items-center gap-2 border-r border-slate-700 pr-2 mr-1 animate-fade-in">
                <div className="flex flex-col">
                    <span className="text-[10px] text-white font-bold leading-none">موسيقى</span>
                    <span className="text-[8px] text-slate-400 leading-none">هادئة</span>
                </div>
                <button onClick={toggleMute} className="text-slate-400 hover:text-white transition-colors">
                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
            </div>
        )}
      </div>

      <style>{`
        .animate-spin-slow {
            animation: spin 8s linear infinite;
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .animate-pulse-slow {
            animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default BackgroundMusic;
