
import React, { useMemo } from 'react';
import { Snowflake } from 'lucide-react';

const SnowfallEffect: React.FC = () => {
  // توليد 120 ندفة ثلج بخصائص عشوائية
  const flakes = useMemo(() => {
    return Array.from({ length: 120 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // موقع أفقي عشوائي
      size: Math.random() * 15 + 8, // أحجام متفاوتة
      duration: Math.random() * 10 + 7, // سرعات هادئة وواقعية
      delay: Math.random() * -20, // تأخير سالب لتبدأ ندفات من منتصف الشاشة فور التشغيل
      opacity: Math.random() * 0.5 + 0.5, // شفافية طبيعية
      drift: Math.random() * 50 - 25, // تمايل جانبي
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {flakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute text-white transition-opacity duration-1000 animate-snowfall"
          style={{
            left: `${flake.left}%`,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            opacity: flake.opacity,
            animationDuration: `${flake.duration}s`,
            animationDelay: `${flake.delay}s`,
            top: '-20px',
            '--drift': `${flake.drift}px`,
            willChange: 'transform',
          } as React.CSSProperties}
        >
          <Snowflake size={flake.size} fill="white" className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]" />
        </div>
      ))}
      <style>{`
        @keyframes snowfall {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          100% {
            transform: translateY(110vh) translateX(var(--drift)) rotate(360deg);
          }
        }
        .animate-snowfall {
          animation: snowfall linear infinite;
        }
      `}</style>
    </div>
  );
};

export default SnowfallEffect;
