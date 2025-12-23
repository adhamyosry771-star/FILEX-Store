
import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { BannerData } from '../types';

interface BannerProps {
  banners: BannerData[];
}

const Banner: React.FC<BannerProps> = ({ banners }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % banners.length);
  const prevSlide = () => setCurrent((prev) => (prev === 0 ? banners.length - 1 : prev - 1));

  if (banners.length === 0) {
    return (
        <div className="w-full aspect-[2/1] md:aspect-[3/1] lg:aspect-[4/1] bg-slate-800 rounded-2xl animate-pulse flex items-center justify-center border border-slate-700 my-4">
             <Loader2 className="animate-spin text-slate-600" size={32} />
        </div>
    );
  }

  return (
    <div className="relative w-full aspect-[2/1] md:aspect-[3/1] lg:aspect-[4/1] overflow-hidden rounded-2xl my-4 shadow-xl group border border-slate-700/50">
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === current ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Image with Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10 opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-l from-slate-900/90 via-slate-900/30 to-transparent z-10" />
          
          <img 
            src={banner.image} 
            alt={banner.title} 
            className="w-full h-full object-cover"
          />

          <div className="absolute bottom-0 right-0 p-6 md:p-10 z-20 w-full md:w-2/3 text-right">
             <span className="inline-block px-3 py-1 bg-teal-500/20 text-teal-300 text-xs font-bold rounded-full mb-3 border border-teal-500/30 backdrop-blur-sm shadow-lg shadow-teal-500/10">
              مميز
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 leading-tight drop-shadow-lg">
              {banner.title}
            </h2>
            <p className="text-slate-300 text-sm md:text-lg mb-4 opacity-90 font-medium drop-shadow-md max-w-lg">
              {banner.subtitle}
            </p>
          </div>
        </div>
      ))}

      {/* Controls */}
      {banners.length > 1 && (
        <>
          <button 
            onClick={nextSlide} 
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-teal-500 text-white p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all z-30"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={prevSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-teal-500 text-white p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all z-30"
          >
            <ChevronRight size={24} />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === current ? 'bg-teal-500 w-8' : 'bg-slate-400/50 w-2'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Banner;
