
import React, { useState } from 'react';
import { Bell, Menu, Search, X, ShieldCheck, Home, User as UserIcon, LogOut, DollarSign, Headset, Code } from 'lucide-react';
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

            {/* Search Bar (Desktop) */}
            <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
              <input 
                type="text" 
                placeholder={t.search_placeholder}
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-full py-2 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
              <Search className={`absolute ${lang === 'ar' ? 'right-3' : 'left-3'} top-2.5 text-slate-400`} size={18} />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              
              {/* Balance Display - Right next to Bell */}
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

          {/* Mobile Search Bar */}
          <div className="mt-3 md:hidden relative">
             <input 
                type="text" 
                placeholder={t.search_placeholder}
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg py-2 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <Search className={`absolute ${lang === 'ar' ? 'right-3' : 'left-3'} top-2.5 text-slate-400`} size={18} />
          </div>
        </div>
      </header>

      {/* Sidebar / Drawer - Z-Index Increased to 100 to cover BottomNav */}
      <div className={`fixed inset-0 z-[100] transition-all duration-300 ${isMenuOpen ? 'visible' : 'invisible'}`}>
         {/* Overlay */}
         <div 
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={toggleMenu}
         ></div>
         
         {/* Side Menu - Transparent Glass Effect */}
         <div className={`absolute top-0 ${lang === 'ar' ? 'right-0' : 'left-0'} h-full w-72 bg-white/50 dark:bg-[#0f172a]/50 backdrop-blur-xl border-l border-slate-200 dark:border-white/10 shadow-2xl p-6 transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : (lang === 'ar' ? 'translate-x-full' : '-translate-x-full')} flex flex-col`}>
             <div className="flex justify-between items-center mb-8">
                 <h2 className="text-2xl font-bold text-slate-900 dark:text-white drop-shadow-md">{t.menu}</h2>
                 <button onClick={toggleMenu} className="p-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 rounded-full text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors">
                     <X size={20} />
                 </button>
             </div>

             <div className="space-y-2 flex-1 overflow-y-auto no-scrollbar">
                 
                 {/* Balance Mobile in Menu */}
                 {user && (
                    <div className="mb-6 p-4 bg-slate-100/50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 flex justify-between items-center shadow-lg backdrop-blur-sm">
                        <span className="text-slate-700 dark:text-slate-200 font-bold">{t.balance}:</span>
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400 font-bold text-xl drop-shadow-sm">
                            <DollarSign size={20} />
                            {user.balance.toFixed(2)}
                        </div>
                    </div>
                 )}

                 {/* Language Switcher */}
                 <div className="flex gap-2 mb-6 justify-center bg-slate-100/50 dark:bg-white/5 p-2 rounded-xl">
                    {(['ar', 'en', 'fr'] as Language[]).map((l) => (
                        <button
                            key={l}
                            onClick={() => setLang(l)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all flex-1 ${lang === l ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                        >
                            {l.toUpperCase()}
                        </button>
                    ))}
                 </div>

                 {/* Standard Links */}
                 <button onClick={() => handleNavClick(Tab.HOME)} className="w-full flex items-center gap-3 p-3 rounded-xl text-slate-700 dark:text-slate-100 hover:bg-slate-100/50 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors font-medium">
                     <Home size={20} /> {t.home}
                 </button>
                 <button onClick={() => handleNavClick(Tab.PROFILE)} className="w-full flex items-center gap-3 p-3 rounded-xl text-slate-700 dark:text-slate-100 hover:bg-slate-100/50 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors font-medium">
                     <UserIcon size={20} /> {t.profile}
                 </button>

                 {/* Customer Service Link */}
                 <button 
                    onClick={() => { onOpenChat(); toggleMenu(); }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-teal-600 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-500/20 hover:text-teal-700 dark:hover:text-teal-200 transition-colors font-medium"
                 >
                     <Headset size={20} /> {t.customer_service}
                 </button>

                 {/* Divider */}
                 <div className="my-4 border-t border-slate-200 dark:border-white/10"></div>

                 {/* Admin Link - Only Visible to Admin */}
                 {user?.isAdmin && (
                    <button 
                        onClick={() => handleNavClick(Tab.ADMIN)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-teal-50/50 to-slate-100/50 dark:from-teal-900/20 dark:to-slate-900/20 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-500/30 hover:border-teal-500/50 transition-all font-bold"
                    >
                        <ShieldCheck size={20} /> 
                        <span>{t.admin}</span>
                    </button>
                 )}

                 {user && (
                    <button onClick={() => { onLogout(); toggleMenu(); }} className="w-full flex items-center gap-3 p-3 rounded-xl text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 mt-2 font-medium">
                        <LogOut size={20} /> {t.logout}
                    </button>
                 )}

                 {/* Footer Credit - Placed directly below the last item inside the scrollable area */}
                 <div className="pt-6 pb-2 text-center">
                    <div className="flex items-center justify-center gap-2 text-teal-600/70 dark:text-teal-400/70 text-xs font-mono font-bold tracking-wider py-2 rounded-lg hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors cursor-default select-none">
                        <Code size={14} />
                        <span>{t.created_by}</span>
                    </div>
                    <div className="text-[10px] text-slate-400/70 dark:text-slate-500/70 font-medium tracking-wide mt-1 select-none">
                        {t.all_rights_reserved}
                    </div>
                 </div>
             </div>
         </div>
      </div>
    </>
  );
};

export default Header;
