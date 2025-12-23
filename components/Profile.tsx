
import React, { useState, useRef } from 'react';
import { User, Order, Tab, Language } from '../types';
import { updateUserProfile, changeUserPassword } from '../auth';
import { LogOut, User as UserIcon, Wallet, Settings, Clock, ChevronLeft, Edit2, Camera, X, Save, DollarSign, CreditCard, MessageCircle, ShieldCheck, Info, Key, CheckCircle, AlertCircle } from 'lucide-react';
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
  // Modal State: 'none' | 'edit' | 'wallet' | 'password'
  const [activeModal, setActiveModal] = useState<'none' | 'edit' | 'wallet' | 'password'>('none');
  const t = TRANSLATIONS[lang];
  
  // Edit Profile State
  const [editName, setEditName] = useState(user.name);
  const [editPhoto, setEditPhoto] = useState(user.photoURL || '');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password Change State
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

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

  const resetModalState = () => {
      setEditName(user.name);
      setEditPhoto(user.photoURL || '');
      setOldPass('');
      setNewPass('');
      setConfirmPass('');
      setPassError('');
      setPassSuccess('');
      setIsSaving(false);
      setIsChangingPass(false);
      setActiveModal('none');
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

  const handleUpdatePassword = async (e: React.FormEvent) => {
      e.preventDefault();
      setPassError('');
      setPassSuccess('');
      
      if (!oldPass || !newPass || !confirmPass) {
          setPassError(lang === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
          return;
      }

      if (newPass !== confirmPass) {
          setPassError(lang === 'ar' ? 'كلمات المرور الجديدة غير متطابقة' : 'New passwords do not match');
          return;
      }

      setIsChangingPass(true);
      const res = await changeUserPassword(oldPass, newPass);
      setIsChangingPass(false);

      if (!res.success) {
          setPassError(res.message || 'Error');
      } else {
          setPassSuccess(lang === 'ar' ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully');
          setOldPass('');
          setNewPass('');
          setConfirmPass('');
          setTimeout(() => resetModalState(), 2000);
      }
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
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={resetModalState}></div>
            <div className="bg-slate-800 w-full max-w-md rounded-3xl border border-slate-700 shadow-2xl relative p-6 animate-fade-in-up">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">{t.edit_profile}</h3>
                    <button onClick={resetModalState} className="text-slate-400 hover:text-white">
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
                        <label className="block text-slate-400 text-xs mb-1 font-bold">{lang === 'ar' ? 'الاسم' : 'Name'}</label>
                        <input 
                            type="text" 
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:border-teal-500 outline-none text-sm"
                        />
                    </div>

                    <button 
                        type="button"
                        onClick={() => setActiveModal('password')}
                        className="flex items-center gap-2 text-teal-400 font-bold text-xs py-2 px-1 hover:text-teal-300 transition-colors"
                    >
                        <Key size={14} /> {lang === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}
                    </button>
                    
                    <button 
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 mt-4 transition-all shadow-lg shadow-teal-500/20"
                    >
                        {isSaving ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : (
                            <>
                                <Save size={18} /> {t.save_changes}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* --- PASSWORD MODAL --- */}
      {activeModal === 'password' && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setActiveModal('edit')}></div>
              <div className="bg-slate-800 w-full max-w-sm rounded-3xl border border-slate-700 shadow-2xl relative p-6 animate-fade-in-up">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          <Key className="text-teal-500" size={20} />
                          {lang === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
                      </h3>
                      <button onClick={() => setActiveModal('edit')} className="text-slate-400 hover:text-white">
                          <X size={24} />
                      </button>
                  </div>

                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                      <div>
                          <label className="block text-slate-400 text-[10px] mb-1 font-bold uppercase tracking-wider">{lang === 'ar' ? 'كلمة المرور القديمة' : 'Old Password'}</label>
                          <input 
                              type="password" 
                              required
                              value={oldPass}
                              onChange={(e) => setOldPass(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:border-teal-500 outline-none text-sm"
                              placeholder="••••••••"
                          />
                      </div>

                      <div className="h-px bg-slate-700 my-2"></div>

                      <div>
                          <label className="block text-slate-400 text-[10px] mb-1 font-bold uppercase tracking-wider">{lang === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}</label>
                          <input 
                              type="password" 
                              required
                              value={newPass}
                              onChange={(e) => setNewPass(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:border-teal-500 outline-none text-sm"
                              placeholder="••••••••"
                          />
                      </div>
                      <div>
                          <label className="block text-slate-400 text-[10px] mb-1 font-bold uppercase tracking-wider">{lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}</label>
                          <input 
                              type="password" 
                              required
                              value={confirmPass}
                              onChange={(e) => setConfirmPass(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:border-teal-500 outline-none text-sm"
                              placeholder="••••••••"
                          />
                      </div>

                      {passError && (
                          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] p-2 rounded-lg flex items-center gap-2">
                              <AlertCircle size={14} /> {passError}
                          </div>
                      )}
                      {passSuccess && (
                          <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] p-2 rounded-lg flex items-center gap-2">
                              <CheckCircle size={14} /> {passSuccess}
                          </div>
                      )}

                      <button 
                          type="submit"
                          disabled={isChangingPass}
                          className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 mt-4 transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50"
                      >
                          {isChangingPass ? (
                              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          ) : (
                              <>
                                  <Save size={18} /> {lang === 'ar' ? 'تأكيد الحفظ' : 'Confirm Save'}
                              </>
                          )}
                      </button>
                  </form>
              </div>
          </div>
      )}

      {/* --- WALLET MODAL (Shortened Version) --- */}
      {activeModal === 'wallet' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setActiveModal('none')}></div>
             <div className="bg-slate-800 w-full max-w-sm rounded-3xl border border-slate-700 shadow-2xl relative p-5 animate-fade-in-up">
                 <div className="flex justify-between items-center mb-4">
                     <h3 className="text-lg font-bold text-white flex items-center gap-2"><Wallet className="text-teal-500" size={18} /> {t.wallet}</h3>
                     <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white">
                         <X size={20} />
                     </button>
                 </div>

                 {/* Digital Card Design - More Compact */}
                 <div className="bg-gradient-to-r from-teal-800 to-slate-900 rounded-xl p-4 border border-teal-500/30 shadow-lg relative overflow-hidden mb-4">
                     <div className="absolute -top-10 -right-10 w-24 h-24 bg-teal-500/20 rounded-full blur-2xl"></div>
                     
                     <div className="flex justify-between items-start mb-6">
                         <CreditCard className="text-teal-200" size={24} />
                         <span className="text-teal-200/50 font-mono tracking-widest text-[10px]">FILEX STORE</span>
                     </div>
                     
                     <div className="mb-3">
                         <span className="text-teal-200/70 text-[10px]">{t.balance}</span>
                         <div className="text-2xl font-bold text-white flex items-center gap-1 font-mono">
                             <DollarSign size={20} />
                             {user.balance.toFixed(2)}
                         </div>
                     </div>

                     <div className="flex justify-between items-end">
                         <div className="text-[10px] text-teal-200/50">ID: {user.customId}</div>
                         <div className="text-[10px] text-teal-200/50 truncate max-w-[120px]">{user.name}</div>
                     </div>
                 </div>

                 {/* Top Up Info - Compact */}
                 {walletWhatsAppNumber && (
                    <div className="text-center animate-fade-in-up mt-1">
                        <p className="text-slate-400 text-[10px] font-medium mb-2">
                            لشحن رصيد برجاء التواصل مع خدمة العملاء
                        </p>
                        <a 
                            href={`https://wa.me/${walletWhatsAppNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white py-2 px-5 rounded-full transition-all shadow-md hover:shadow-teal-500/30 group mx-auto"
                        >
                            <MessageCircle size={16} fill="currentColor" />
                            <span className="font-mono text-sm font-bold pt-0.5 ltr-text">{walletWhatsAppNumber}</span>
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
