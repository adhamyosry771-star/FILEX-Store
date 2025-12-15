
import React from 'react';
import { Home, Grid, User } from 'lucide-react';
import { Tab, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  lang: Language;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, lang }) => {
  const t = TRANSLATIONS[lang];
  
  const navItems = [
    { id: Tab.HOME, icon: Home, label: t.home },
    { id: Tab.STORE, icon: Grid, label: t.store },
    { id: Tab.PROFILE, icon: User, label: t.profile },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0f172a]/95 backdrop-blur-lg border-t border-slate-800 pb-safe md:hidden z-50">
      <div className="flex justify-around items-center px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 w-16 ${
                isActive ? 'text-teal-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Active Indicator Background */}
              {isActive && (
                <div className="absolute inset-0 bg-teal-500/10 rounded-xl -z-10 scale-90" />
              )}
              
              <div className="relative">
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] mt-1 font-medium ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
