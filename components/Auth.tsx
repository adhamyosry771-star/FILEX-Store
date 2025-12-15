
import React, { useState, useRef } from 'react';
import { User } from '../types';
import { signInWithGoogle, registerWithEmail, loginWithEmail, setupRecaptcha, sendOtp, verifyOtp, resetPassword } from '../auth';
import { Loader2, ArrowRight, Mail, Smartphone, Globe, Upload, Camera, X, Lock } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

type AuthMethod = 'email' | 'phone';

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [method, setMethod] = useState<AuthMethod>('email');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isForgotMode, setIsForgotMode] = useState(false); // Forgot Password Mode
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Email State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [photoURL, setPhotoURL] = useState<string>('');
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Phone State
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoURL(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const result = await signInWithGoogle();
    if (result.success && result.user) {
      onLogin(result.user);
    } else {
      setError(result.message || 'فشل تسجيل الدخول بجوجل');
    }
    setLoading(false);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    if (isForgotMode) {
        const result = await resetPassword(email);
        if (result.success) {
            setSuccessMsg('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.');
        } else {
            setError(result.message || 'خطأ');
        }
    } else if (isLoginMode) {
      const result = await loginWithEmail(email, password);
      if (result.success && result.user) onLogin(result.user);
      else setError(result.message || 'خطأ');
    } else {
      const result = await registerWithEmail(email, password, name, photoURL);
      if (result.success && result.user) onLogin(result.user);
      else setError(result.message || 'خطأ');
    }
    setLoading(false);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Initialize Recaptcha
    try {
        const verifier = setupRecaptcha('recaptcha-container');
        const result = await sendOtp(phone, verifier);
        
        if (result.success) {
            setConfirmationResult(result.confirmationResult);
            setOtpSent(true);
        } else {
            setError(result.message || 'فشل إرسال الرمز');
        }
    } catch (e) {
        setError('حدث خطأ في التحقق');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await verifyOtp(confirmationResult, otpCode);
    if (result.success && result.user) {
        onLogin(result.user);
    } else {
        setError(result.message || 'رمز التحقق خاطئ');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 w-full">
      <div className="w-full max-w-md bg-slate-800/50 backdrop-blur-xl p-8 rounded-3xl border border-slate-700 shadow-2xl relative overflow-hidden">
        
        {/* Decorational Background */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-teal-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-center mb-2">
            {isForgotMode ? 'استعادة كلمة المرور' : 'مرحباً بك في FILEX'}
          </h2>
          
          {/* Method Tabs - Only if not in forgot mode */}
          {!isForgotMode && (
            <div className="flex bg-slate-900/50 p-1 rounded-xl mb-6 mt-4">
                <button
                onClick={() => { setMethod('email'); setOtpSent(false); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${method === 'email' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                >
                <Mail size={16} /> البريد
                </button>
                <button
                onClick={() => { setMethod('phone'); setOtpSent(false); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${method === 'phone' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                >
                <Smartphone size={16} /> الهاتف
                </button>
            </div>
          )}

          {/* Google Button - Only if not in forgot mode */}
          {!isForgotMode && (
            <button
                onClick={handleGoogleLogin}
                className="w-full bg-white text-slate-900 font-bold py-3 rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 mb-6"
            >
                <Globe size={20} className="text-blue-600" />
                استمرار باستخدام Google
            </button>
          )}

          {!isForgotMode && (
            <div className="relative flex py-2 items-center mb-6">
                <div className="flex-grow border-t border-slate-700"></div>
                <span className="flex-shrink-0 mx-4 text-slate-500 text-xs">أو باستخدام {method === 'email' ? 'البريد' : 'رقم الهاتف'}</span>
                <div className="flex-grow border-t border-slate-700"></div>
            </div>
          )}

          {/* EMAIL FORM */}
          {method === 'email' && (
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {/* Reset Password UI */}
              {isForgotMode ? (
                  <>
                    <p className="text-slate-400 text-sm text-center mb-4">أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.</p>
                    <div>
                        <label className="block text-slate-300 text-sm mb-1">البريد الإلكتروني</label>
                        <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500"
                        placeholder="name@example.com"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'إرسال رابط التعيين'}
                    </button>
                    <div className="text-center mt-2">
                        <button
                            type="button"
                            onClick={() => { setIsForgotMode(false); setError(''); setSuccessMsg(''); }}
                            className="text-slate-400 text-sm hover:text-white"
                        >
                            العودة لتسجيل الدخول
                        </button>
                    </div>
                  </>
              ) : (
                  <>
                    {!isLoginMode && (
                        <>
                            {/* Profile Picture Upload */}
                            <div className="flex justify-center mb-4">
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={handleImageUpload}
                                />
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="relative w-20 h-20 rounded-full bg-slate-700 border-2 border-dashed border-slate-500 flex items-center justify-center cursor-pointer hover:bg-slate-600 overflow-hidden"
                                >
                                    {photoURL ? (
                                        <img src={photoURL} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <Camera size={24} className="text-slate-400" />
                                    )}
                                    
                                    {!photoURL && <div className="absolute bottom-1 text-[8px] text-slate-400">صورة (اختياري)</div>}
                                </div>
                                {photoURL && (
                                    <button 
                                        type="button"
                                        onClick={() => setPhotoURL('')}
                                        className="absolute bg-red-500 rounded-full p-1 text-white transform translate-x-10 translate-y-1"
                                    >
                                        <X size={12} />
                                    </button>
                                )}
                            </div>

                            <div>
                            <label className="block text-slate-300 text-sm mb-1">الاسم</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500"
                                placeholder="الاسم الكامل"
                            />
                            </div>
                        </>
                    )}
                    <div>
                        <label className="block text-slate-300 text-sm mb-1">البريد الإلكتروني</label>
                        <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500"
                        placeholder="name@example.com"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-slate-300 text-sm">كلمة المرور</label>
                            {isLoginMode && (
                                <button type="button" onClick={() => setIsForgotMode(true)} className="text-xs text-teal-400 hover:underline">
                                    نسيت كلمة المرور؟
                                </button>
                            )}
                        </div>
                        <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500"
                        placeholder="••••••••"
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (isLoginMode ? 'دخول' : 'حساب جديد')}
                    </button>

                    <div className="text-center mt-2">
                        <button
                            type="button"
                            onClick={() => setIsLoginMode(!isLoginMode)}
                            className="text-teal-400 text-sm hover:underline"
                        >
                            {isLoginMode ? 'ليس لديك حساب؟ سجل الآن' : 'لديك حساب؟ سجل دخول'}
                        </button>
                    </div>
                  </>
              )}
            </form>
          )}

          {/* PHONE FORM */}
          {method === 'phone' && !isForgotMode && (
            <div className="space-y-4">
                {!otpSent ? (
                     <form onSubmit={handleSendOtp} className="space-y-4">
                        <div>
                            <label className="block text-slate-300 text-sm mb-1">رقم الهاتف (مع الرمز الدولي)</label>
                            <input
                                type="tel"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 ltr-text text-left"
                                placeholder="+201xxxxxxxxx"
                                style={{ direction: 'ltr' }}
                            />
                             <p className="text-xs text-slate-500 mt-1 text-right">يجب أن يبدأ بـ +</p>
                        </div>
                        <div id="recaptcha-container"></div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
                        >
                             {loading ? <Loader2 className="animate-spin" size={20} /> : 'إرسال الرمز'}
                        </button>
                     </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div className="text-center mb-4">
                            <p className="text-slate-300 text-sm">تم إرسال الرمز إلى {phone}</p>
                            <button type="button" onClick={() => setOtpSent(false)} className="text-teal-400 text-xs">تغيير الرقم</button>
                        </div>
                         <div>
                            <label className="block text-slate-300 text-sm mb-1">رمز التحقق</label>
                            <input
                                type="text"
                                required
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value)}
                                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 text-center tracking-widest text-xl"
                                placeholder="123456"
                            />
                        </div>
                         <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
                        >
                             {loading ? <Loader2 className="animate-spin" size={20} /> : 'تحقق ودخول'}
                        </button>
                    </form>
                )}
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg text-center">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="mt-4 bg-green-500/10 border border-green-500/20 text-green-400 text-sm p-3 rounded-lg text-center">
              {successMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
