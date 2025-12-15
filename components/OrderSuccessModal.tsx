
import React, { useEffect } from 'react';
import { BadgeCheck, X } from 'lucide-react';

interface OrderSuccessModalProps {
  onClose: () => void;
}

const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ onClose }) => {
  
  useEffect(() => {
    // تشغيل صوت الكاشير/النجاح عند فتح النافذة
    const playSuccessSound = async () => {
      try {
        // رابط صوت كاشير (Cash Register)
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
        audio.volume = 0.6; // مستوى الصوت
        await audio.play();
      } catch (error) {
        console.error("Failed to play success sound:", error);
      }
    };

    playSuccessSound();
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-slate-800 w-72 aspect-square rounded-[2.5rem] border border-slate-700/50 shadow-2xl flex flex-col items-center justify-center p-6 text-center animate-fade-in-up">
        
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-teal-500/5 rounded-[2.5rem] pointer-events-none"></div>

        {/* Close Button */}
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
        >
            <X size={20} />
        </button>

        {/* Icon */}
        <div className="mb-4 relative">
            <div className="absolute inset-0 bg-teal-500/20 blur-xl rounded-full"></div>
            <BadgeCheck size={64} className="text-teal-500 relative z-10" />
        </div>

        {/* Main Text */}
        <h3 className="text-white font-bold text-base mb-2 leading-snug">
          شكراً لكم علي اختياركم <br/> <span className="text-teal-400">FILEX Store</span>
        </h3>

        {/* Sub Text */}
        <p className="text-slate-400 text-[11px] font-medium leading-relaxed px-2">
          برجاء الانتظار حتى يتم قبول الطلب
        </p>

      </div>
    </div>
  );
};

export default OrderSuccessModal;
