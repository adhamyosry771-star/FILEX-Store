
import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

interface SuccessModalProps {
  message: string;
  subMessage: string;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ message, subMessage, onClose }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Sequence the animations
    const t1 = setTimeout(() => setStep(1), 100); // Start circle
    const t2 = setTimeout(() => setStep(2), 600); // Show check
    const t3 = setTimeout(() => setStep(3), 800); // Show text

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[200] bg-[#0f172a] flex flex-col items-center justify-center font-cairo">
      {/* Background Particles/Glow */}
      <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/20 rounded-full blur-[100px] animate-pulse"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Circle & Check */}
        <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
            {/* Outer Ring */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle
                    cx="64"
                    cy="64"
                    r="60"
                    fill="none"
                    stroke="#0f172a"
                    strokeWidth="4"
                />
                <circle
                    cx="64"
                    cy="64"
                    r="60"
                    fill="none"
                    stroke="#2dd4bf"
                    strokeWidth="4"
                    strokeDasharray="377"
                    strokeDashoffset={step >= 1 ? "0" : "377"}
                    className="transition-all duration-[800ms] ease-out"
                    style={{ strokeLinecap: 'round' }}
                />
            </svg>
            
            {/* Inner Glow Circle */}
            <div className={`w-24 h-24 rounded-full bg-teal-500 shadow-[0_0_50px_rgba(45,212,191,0.6)] flex items-center justify-center transition-all duration-500 ${step >= 2 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                <Check size={48} className="text-white drop-shadow-md" strokeWidth={4} />
            </div>
        </div>

        {/* Text Content */}
        <div className={`text-center transition-all duration-700 transform ${step >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-wide">
                شكراً لاستخدامك <span className="text-teal-400">FILEX Store</span>
            </h2>
            <p className="text-slate-400 text-lg font-medium bg-slate-800/50 py-2 px-6 rounded-full border border-slate-700/50 inline-block backdrop-blur-md">
                {subMessage}
            </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
