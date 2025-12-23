
import React from 'react';
import { Shield, ArrowRight, ArrowLeft, Lock, EyeOff, FileText, CheckCircle } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface PrivacyPageProps {
  onBack: () => void;
  lang: Language;
}

const PrivacyPage: React.FC<PrivacyPageProps> = ({ onBack, lang }) => {
  const t = TRANSLATIONS[lang];

  const sections = [
    {
      icon: Lock,
      title: lang === 'ar' ? 'حماية البيانات' : 'Data Protection',
      content: lang === 'ar' ? 'نحن نستخدم أحدث تقنيات التشفير لضمان أن بياناتك الشخصية وتفاصيل حساباتك في أمان تام.' : 'We use the latest encryption technologies to ensure your personal data and account details are completely safe.'
    },
    {
      icon: EyeOff,
      title: lang === 'ar' ? 'سرية المعلومات' : 'Information Privacy',
      content: lang === 'ar' ? 'لا نقوم بمشاركة بياناتك مع أي طرف ثالث تحت أي ظرف من الظروف. خصوصيتك هي أولويتنا القصوى.' : 'We do not share your data with any third party under any circumstances. Your privacy is our top priority.'
    },
    {
      icon: FileText,
      title: lang === 'ar' ? 'استخدام البيانات' : 'Data Usage',
      content: lang === 'ar' ? 'نجمع فقط المعلومات الضرورية لإتمام عمليات الشحن وتقديم الدعم الفني اللازم لك.' : 'We only collect the information necessary to complete top-up operations and provide necessary technical support to you.'
    },
    {
      icon: CheckCircle,
      title: lang === 'ar' ? 'الموافقة' : 'Consent',
      content: lang === 'ar' ? 'باستخدامك لمتجر FILEX Store، فإنك توافق على سياسة الخصوصية الخاصة بنا وشروط الخدمة.' : 'By using FILEX Store, you agree to our privacy policy and terms of service.'
    }
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
            <Shield className="text-teal-500" /> {t.privacy_policy}
        </h2>
      </div>

      <div className="space-y-4">
        {sections.map((sec, idx) => (
          <div key={idx} className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-6 rounded-3xl shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-teal-500/10 rounded-xl text-teal-400">
                <sec.icon size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">{sec.title}</h3>
            </div>
            <p className="text-slate-400 leading-relaxed text-sm md:text-base">
              {sec.content}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center text-slate-500 text-xs">
        {lang === 'ar' ? 'آخر تحديث: يناير 2025' : 'Last Updated: January 2025'}
      </div>
    </div>
  );
};

export default PrivacyPage;
