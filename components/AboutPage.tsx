
import React from 'react';
import { Info, ArrowRight, ArrowLeft, Star, Zap, ShieldCheck, Heart } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface AboutPageProps {
  onBack: () => void;
  lang: Language;
}

const AboutPage: React.FC<AboutPageProps> = ({ onBack, lang }) => {
  const t = TRANSLATIONS[lang];

  const features = [
    { icon: Zap, label: lang === 'ar' ? 'سرعة فائقة' : 'Super Speed', color: 'text-teal-400' },
    { icon: ShieldCheck, label: lang === 'ar' ? 'أمان تام' : 'Full Security', color: 'text-teal-400' },
    { icon: Star, label: lang === 'ar' ? 'خدمة مميزة' : 'Premium Service', color: 'text-teal-400' },
    { icon: Heart, label: lang === 'ar' ? 'دعم مستمر' : '24/7 Support', color: 'text-teal-400' }
  ];

  return (
    <div className="px-4 pb-20 min-h-screen animate-fade-in">
      <div className="flex items-center gap-3 py-6">
        <button 
          onClick={onBack}
          className="bg-slate-800 p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
        >
          {lang === 'ar' ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
        </button>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Info className="text-teal-500" /> {t.about_us}
        </h2>
      </div>

      <div className="bg-gradient-to-br from-teal-500/10 to-purple-500/10 border border-slate-700/50 rounded-3xl p-8 mb-8 text-center relative overflow-hidden">
        <div className="w-24 h-24 bg-gradient-to-tr from-teal-400 to-cyan-600 rounded-full flex items-center justify-center text-white font-black text-4xl mx-auto mb-6 shadow-2xl shadow-teal-500/20">
          F
        </div>
        <h3 className="text-3xl font-black text-white mb-4">FILEX Store</h3>
        <p className="text-slate-300 leading-relaxed max-w-2xl mx-auto italic">
          {lang === 'ar' 
            ? '"نحن لسنا مجرد متجر شحن، نحن شركاؤك في المتعة. نسعى دائماً لتوفير أفضل تجربة شحن رقمي في الوطن العربي بأمان وسرعة لا تضاهى."'
            : '"We are not just a top-up store, we are your partners in fun. We always strive to provide the best digital charging experience in the Arab world with unmatched security and speed."'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {features.map((f, idx) => (
          <div key={idx} className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50 flex flex-col items-center gap-3 text-center transition-all hover:bg-slate-800">
            <f.icon size={32} className={f.color} />
            <span className="font-bold text-white text-sm">{f.label}</span>
          </div>
        ))}
      </div>

      <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50">
        <h4 className="text-teal-400 font-bold mb-3 flex items-center gap-2 uppercase tracking-widest text-xs">
          {lang === 'ar' ? 'رؤيتنا' : 'Our Vision'}
        </h4>
        <p className="text-slate-400 text-sm leading-relaxed">
          {lang === 'ar' 
            ? 'توفير منصة موحدة وسهلة الاستخدام لجميع اللاعبين والمستخدمين الرقميين، تضمن لهم الحصول على منتجاتهم فوراً وبأفضل الأسعار التنافسية في السوق.'
            : 'Providing a unified and easy-to-use platform for all gamers and digital users, ensuring they get their products instantly and at the best competitive prices in the market.'}
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
