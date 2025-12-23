
import React, { useState, useEffect } from 'react';
import { Bell, Menu, X, ShieldCheck, Home, User as UserIcon, LogOut, DollarSign, Headset, Code, ShieldAlert, Info } from 'lucide-react';
import { Tab, User as UserType, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface HeaderProps {
  onTabChange: (tab: Tab) => void;
  user: UserType | null;
  onOpenChat: () => void;
  lang: Language;
  setLang: (lang: Language) => void;
  unreadNotifications: number;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onTabChange, user, onOpenChat, lang, setLang, unreadNotifications, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = TRANSLATIONS[lang];

  // منع التمرير عند فتح القائمة الجانبية
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none'; // منع السحب في المتصفحات التي تدعمها
      document.body.style.overscrollBehavior = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      document.body.style.overscrollBehavior = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      document.body.style.overscrollBehavior = '';
    };
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleNavClick = (tab: Tab) => {
    onTabChange(tab);
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            
            {/* Logo Area */}
            <div className="flex items-center gap-3">
              <button 
                onClick={toggleMenu}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 transition-colors"
              >
                <Menu size={24} />
              </button>
              <div 
                onClick={() => onTabChange(Tab.HOME)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-400 to-cyan-600 flex items-center justify-center text-white font-bold text-xl">
                  F
                </div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-cyan-500 dark:from-teal-400 dark:to-cyan-300 hidden sm:block">
                  FILEX Store
                </h1>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              
              {/* Balance Display */}
              {user && (
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-200 dark:border-teal-500/30 shadow-sm hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                    <div className="bg-green-500/10 p-1 rounded-full">
                         <DollarSign size={14} className="text-green-600 dark:text-green-400" />
                    </div>
                    <span className="font-bold text-green-600 dark:text-green-400 text-sm tracking-wide">{user.balance.toFixed(2)}</span>
                </div>
              )}

              <button 
                onClick={() => user ? onTabChange(Tab.NOTIFICATIONS) : onTabChange(Tab.PROFILE)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 transition-colors relative"
              >
                <Bell size={24} />
                {unreadNotifications > 0 && (
                    <span className="absolute top-1 left-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white dark:border-[#0f172a] animate-pulse">
                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </span>
                )}
              </button>
              
               {!user ? (
                 <div onClick={() => onTabChange(Tab.PROFILE)} className="flex items-center gap-2 border-slate-700 cursor-pointer bg-teal-500 hover:bg-teal-600 text-white px-4 py-1.5 rounded-full transition-colors">
                    <span className="text-sm font-bold">{t.login}</span>
                </div>
               ) : (
                  <div className="w-9 h-9 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/50 text-xs font-bold overflow-hidden cursor-pointer hover:border-teal-400 transition-colors" onClick={() => onTabChange(Tab.PROFILE)}>
                      {user.photoURL ? (
                          <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                          user.name.charAt(0)
                      )}
                  </div>
               )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar / Drawer */}
      <div className={`fixed inset-0 z-[100] transition-all duration-300 ${isMenuOpen ? 'visible' : 'invisible'}`}>
         {/* Overlay - Slightly more transparent to blend in */}
         <div 
            className={`absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 touch-none ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={toggleMenu}
         ></div>
         
         {/* Side Menu - Increased Transparency with High Blur */}
         <div className={`absolute top-0 ${lang === 'ar' ? 'right-0' : 'left-0'} h-full w-72 bg-white/20 dark:bg-[#0f172a]/30 backdrop-blur-2xl border-l border-white/10 shadow-2xl p-6 transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : (lang === 'ar' ? 'translate-x-full' : '-translate-x-full')} flex flex-col`}>
             
             {/* Header */}
             <div className="flex justify-between items-center mb-8 shrink-0">
                 <h2 className="text-2xl font-bold text-slate-900 dark:text-white drop-shadow-md">{t.menu}</h2>
                 <button onClick={toggleMenu} className="p-2 bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 rounded-full text-slate-800 dark:text-slate-200 transition-colors">
                     <X size={20} />
                 </button>
             </div>

             {/* Navigation Section */}
             <div className="flex-1 flex flex-col gap-2 overflow-y-auto no-scrollbar pb-6">
                 
                 {/* Balance - Floating Glass Card */}
                 {user && (
                    <div className="mb-6 p-4 bg-white/10 dark:bg-white/5 rounded-2xl border border-white/20 dark:border-white/10 flex justify-between items-center shadow-lg backdrop-blur-md">
                        <span className="text-slate-700 dark:text-slate-200 font-bold">{t.balance}:</span>
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400 font-bold text-xl">
                            <DollarSign size={20} />
                            {user.balance.toFixed(2)}
                        </div>
                    </div>
                 )}

                 {/* Language Switcher */}
                 <div className="flex gap-2 mb-6 justify-center bg-white/10 dark:bg-white/5 p-2 rounded-2xl border border-white/10 shrink-0">
                    {(['ar', 'en', 'fr'] as Language[]).map((l) => (
                        <button
                            key={l}
                            onClick={() => setLang(l)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex-1 ${lang === l ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20' : 'text-slate-700 dark:text-slate-400 hover:bg-white/20'}`}
                        >
                            {l.toUpperCase()}
                        </button>
                    ))}
                 </div>

                 {/* Main Links - Spacious */}
                 <button onClick={() => handleNavClick(Tab.HOME)} className="w-full flex items-center gap-4 p-4 rounded-2xl text-slate-800 dark:text-slate-100 hover:bg-white/20 dark:hover:bg-white/10 transition-colors font-bold text-base group">
                     <Home size={22} className="text-teal-500 group-hover:scale-110 transition-transform" /> {t.home}
                 </button>
                 
                 <button onClick={() => handleNavClick(Tab.PROFILE)} className="w-full flex items-center gap-4 p-4 rounded-2xl text-slate-800 dark:text-slate-100 hover:bg-white/20 dark:hover:bg-white/10 transition-colors font-bold text-base group">
                     <UserIcon size={22} className="text-teal-500 group-hover:scale-110 transition-transform" /> {t.profile}
                 </button>

                 <button onClick={() => handleNavClick(Tab.PRIVACY)} className="w-full flex items-center gap-4 p-4 rounded-2xl text-slate-800 dark:text-slate-100 hover:bg-white/20 dark:hover:bg-white/10 transition-colors font-bold text-base group">
                     <ShieldAlert size={22} className="text-teal-500 group-hover:scale-110 transition-transform" /> {t.privacy_policy}
                 </button>

                 <button onClick={() => handleNavClick(Tab.ABOUT)} className="w-full flex items-center gap-4 p-4 rounded-2xl text-slate-800 dark:text-slate-100 hover:bg-white/20 dark:hover:bg-white/10 transition-colors font-bold text-base group">
                     <Info size={22} className="text-teal-500 group-hover:scale-110 transition-transform" /> {t.about_us}
                 </button>

                 <button 
                    onClick={() => { onOpenChat(); toggleMenu(); }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl text-teal-600 dark:text-teal-400 hover:bg-teal-500/10 transition-colors font-bold text-base group"
                 >
                     <Headset size={22} className="group-hover:scale-110 transition-transform" /> {t.customer_service}
                 </button>

                 <div className="my-4 border-t border-white/20 dark:border-white/10 shrink-0"></div>

                 {user?.isAdmin && (
                    <button 
                        onClick={() => handleNavClick(Tab.ADMIN)}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 font-bold text-base group"
                    >
                        <ShieldCheck size={22} className="group-hover:scale-110 transition-transform" /> 
                        <span>{t.admin}</span>
                    </button>
                 )}

                 {user && (
                    <button onClick={() => { onLogout(); toggleMenu(); }} className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-500 dark:text-red-400 hover:bg-red-500/10 font-bold text-base group">
                        <LogOut size={22} className="group-hover:translate-x-1 transition-transform" /> {t.logout}
                    </button>
                 )}
             </div>

             {/* Footer - Pinned to bottom */}
             <div className="pt-6 mt-auto border-t border-white/20 dark:border-white/10 text-center shrink-0">
                <a 
                    href="https://filex-developer.vercel.app/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-teal-600 dark:text-teal-400 text-xs font-mono font-bold tracking-wider py-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                >
                    <Code size={14} />
                    <span>{t.created_by}</span>
                </a>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide mt-1 select-none pb-2">
                    {t.all_rights_reserved}
                </div>
             </div>
         </div>
      </div>
    </>
  );
};

export default Header;
