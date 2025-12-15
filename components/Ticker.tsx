import React from 'react';
import { Megaphone } from 'lucide-react';

interface TickerProps {
  message: string;
}

const Ticker: React.FC<TickerProps> = ({ message }) => {
  if (!message) return null;

  return (
    // Outer Container: 
    // - Reduced height to h-10 (slim)
    // - Removed mx-4 to make it full width of the container
    // - Changed rounded-2xl to rounded-lg for a cleaner look on a slimmer bar
    <div className="w-full mb-6 h-10 flex items-center bg-teal-900/10 backdrop-blur-md border border-teal-500/20 shadow-lg rounded-lg overflow-hidden relative">
      
      {/* 1. Fixed Icon Section */}
      <div className="h-full px-3 flex items-center justify-center bg-slate-900/40 border-l border-teal-500/20 z-10 shrink-0">
        <Megaphone size={16} className="text-teal-400 animate-pulse" />
      </div>

      {/* 2. Scrolling Text Area */}
      <div className="flex-1 h-full relative overflow-hidden">
        <div className="whitespace-nowrap absolute top-1/2 -translate-y-1/2 animate-marquee text-sm font-bold text-slate-200">
          {message}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { right: -100%; transform: translate(0, -50%); } 
          100% { right: 100%; transform: translate(0, -50%); }
        }
        .animate-marquee {
          animation: marquee 15s linear infinite;
          /* Ensure text starts vertically centered */
          top: 50%;
        }
      `}</style>
    </div>
  );
};

export default Ticker;
