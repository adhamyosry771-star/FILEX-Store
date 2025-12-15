
import React, { useState, useRef } from 'react';
import { User, Order, Tab, Language } from '../types';
import { updateUserProfile } from '../auth';
import { LogOut, User as UserIcon, Wallet, Settings, Clock, ChevronLeft, Edit2, Camera, X, Save, DollarSign, CreditCard, MessageCircle } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface ProfileProps {
  user: User;
  onLogout: () => void;
  onUpdateUser: () => void;
  orders: Order[];
  onTabChange: (tab: Tab) => void;
  lang: Language;
  walletWhatsAppNumber?: string;
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout, onUpdateUser, orders, onTabChange, lang, walletWhatsAppNumber }) => {
  // Modal State: 'none' | 'edit' | 'wallet'
  const [activeModal, setActiveModal] = useState<'none' | 'edit' | 'wallet'>('none');
  const t = TRANSLATIONS[lang];
  
  // Edit Profile State
  const [editName, setEditName] = useState(user.name);
  const [editPhoto, setEditPhoto] = useState(user.photoURL || '');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = () => {
    onLogout();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
      setIsSaving(true);
      await updateUserProfile(user.id, {
          name: editName,
          photoURL: editPhoto || undefined
      });
      onUpdateUser(); 
      setIsSaving(false);
      setActiveModal('none');
  };

  const menuItems = [
    { icon: Clock, label: t.orders, desc: t.no_orders, action: () => onTabChange(Tab.ORDERS) },
    { icon: Wallet, label: t.wallet, desc: `${t.balance}: ${user.balance.toFixed(2)} $`, action: () => setActiveModal('wallet') },
    { icon: Settings, label: t.settings, desc: t.edit_profile, action: () => { setEditName(user.name); setEditPhoto(user.photoURL || ''); setActiveModal('edit'); } },
  ];

  return (
    <div className="px-4 pb-20">
      {/* Header Profile Card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-3xl border border-slate-700 shadow-xl relative overflow-hidden mb-6 mt-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-bl-full -mr-4 -mt-4"></div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-teal-400 to-cyan-600 flex items-center justify-center text-slate-900 shadow-lg overflow-hidden border-2 border-slate-600">
            {user.photoURL ? (
                <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
            ) : (
                <UserIcon size={32} strokeWidth={1.5} />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {user.name}
                <button onClick={() => { setEditName(user.name); setEditPhoto(user.photoURL || ''); setActiveModal('edit'); }} className="bg-slate-700 hover:bg-slate-600 p-1.5 rounded-full transition-colors">
                    <Edit2 size={12} className="text-teal-400" />
                </button>
            </h2>
            <div className="flex items-center gap-2 mt-1">
                 <p className="text-slate-400 text-xs font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-600">ID: {user.customId}</p>
                 {user.isAdmin && <span className="text-teal-400 text-xs font-bold border border-teal-500/30 px-2 py-0.5 rounded">Admin</span>}
            </div>
            <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">
                    {lang === 'ar' ? 'تم الانضمام في ' : 'Joined '}
                    {new Date(user.joinDate).toLocaleDateString('en-GB')}
                </span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Options */}
      <div className="space-y-3">
        {menuItems.map((item, idx) => (
          <button 
            key={idx}
            onClick={item.action}
            className="w-full bg-slate-800/50 hover:bg-slate-800 p-4 rounded-2xl flex items-center justify-between border border-slate-700/50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-700/50 rounded-xl text-teal-400 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                <item.icon size={20} />
              </div>
              <div className={`${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                <h3 className="font-bold text-slate-200">{item.label}</h3>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
            </div>
            <ChevronLeft size={18} className={`text-slate-600 group-hover:text-slate-300 ${lang === 'ar' ? '' : 'rotate-180'}`} />
          </button>
        ))}

        <button 
          onClick={handleLogout}
          className="w-full bg-red-500/10 hover:bg-red-500/20 p-4 rounded-2xl flex items-center justify-between border border-red-500/20 mt-8 group transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/20 rounded-xl text-red-500 group-hover:text-red-400">
              <LogOut size={20} />
            </div>
            <div className={`${lang === 'ar' ? 'text-right' : 'text-left'}`}>
              <h3 className="font-bold text-red-400">{t.logout}</h3>
            </div>
          </div>
        </button>
      </div>

      {/* --- EDIT MODAL --- */}
      {activeModal === 'edit' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setActiveModal('none')}></div>
            <div className="bg-slate-800 w-full max-w-md rounded-3xl border border-slate-700 shadow-2xl relative p-6 animate-fade-in-up">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">{t.edit_profile}</h3>
                    <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex justify-center mb-6">
                     <input 
                        type="file" 
                        ref={fileInputRef}
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageUpload}
                    />
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-600 group-hover:border-teal-500 transition-colors">
                            {editPhoto ? (
                                <img src={editPhoto} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                                    <UserIcon size={40} className="text-slate-500" />
                                </div>
                            )}
                        </div>
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="text-white" size={24} />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-slate-400 text-sm mb-1">Name</label>
                        <input 
                            type="text" 
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2 text-white focus:border-teal-500 outline-none"
                        />
                    </div>
                    
                    <button 
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 mt-4"
                    >
                        {isSaving ? '...' : (
                            <>
                                <Save size={18} /> {t.save_changes}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* --- WALLET MODAL --- */}
      {activeModal === 'wallet' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setActiveModal('none')}></div>
             <div className="bg-slate-800 w-full max-w-sm rounded-3xl border border-slate-700 shadow-2xl relative p-6 animate-fade-in-up">
                 <div className="flex justify-between items-center mb-6">
                     <h3 className="text-xl font-bold text-white flex items-center gap-2"><Wallet className="text-teal-500" /> {t.wallet}</h3>
                     <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white">
                         <X size={24} />
                     </button>
                 </div>

                 {/* Digital Card Design */}
                 <div className="bg-gradient-to-r from-teal-800 to-slate-900 rounded-2xl p-6 border border-teal-500/30 shadow-lg relative overflow-hidden mb-6">
                     <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-500/20 rounded-full blur-2xl"></div>
                     
                     <div className="flex justify-between items-start mb-8">
                         <CreditCard className="text-teal-200" size={32} />
                         <span className="text-teal-200/50 font-mono tracking-widest text-xs">FILEX STORE</span>
                     </div>
                     
                     <div className="mb-4">
                         <span className="text-teal-200/70 text-xs">{t.balance}</span>
                         <div className="text-3xl font-bold text-white flex items-center gap-1 font-mono">
                             <DollarSign size={24} />
                             {user.balance.toFixed(2)}
                         </div>
                     </div>

                     <div className="flex justify-between items-end">
                         <div className="text-xs text-teal-200/50">ID: {user.customId}</div>
                         <div className="text-xs text-teal-200/50">{user.name}</div>
                     </div>
                 </div>

                 {/* Top Up Info */}
                 {walletWhatsAppNumber && (
                    <div className="text-center animate-fade-in-up mt-2">
                        <p className="text-slate-400 text-[10px] font-medium mb-2">
                            لشحن رصيد برجاء التواصل مع خدمة العملاء
                        </p>
                        <a 
                            href={`https://wa.me/${walletWhatsAppNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white py-1.5 px-4 rounded-full transition-all shadow-sm hover:shadow-teal-500/20 group mx-auto"
                        >
                            <MessageCircle size={14} fill="currentColor" />
                            <span className="font-mono text-xs font-bold pt-0.5 ltr-text">{walletWhatsAppNumber}</span>
                        </a>
                    </div>
                 )}
             </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
