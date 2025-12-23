
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Headset, Bot, Clock, AlertTriangle, User } from 'lucide-react';
import { User as UserType, ChatMessage, SupportSession } from '../types';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, doc, updateDoc, arrayUnion, query, where, getDocs } from 'firebase/firestore';

interface CustomerSupportProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
}

const CustomerSupport: React.FC<CustomerSupportProps> = ({ isOpen, onClose, user }) => {
  const [viewState, setViewState] = useState<'bot' | 'queue' | 'chat' | 'ended'>('bot');
  const [input, setInput] = useState('');
  const [activeSession, setActiveSession] = useState<SupportSession | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check for existing active session on mount/open
  useEffect(() => {
    if (!user || !isOpen) {
        if (!isOpen) setViewState('bot'); // Reset when closed
        return;
    }

    // Listen for any active or queued session for this user
    const q = query(
        collection(db, "support_chats"), 
        where("userId", "==", user.id),
        where("status", "in", ["queued", "active"])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
            const docData = snapshot.docs[0].data() as SupportSession;
            const docId = snapshot.docs[0].id;
            const session = { ...docData, id: docId };
            
            setActiveSession(session);
            
            if (session.status === 'queued') setViewState('queue');
            else if (session.status === 'active') setViewState('chat');
        } else {
            // No active session found
            setActiveSession(null);
            if (viewState !== 'ended') setViewState('bot');
        }
    });

    return () => unsubscribe();
  }, [user, isOpen]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (activeSession?.messages) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeSession?.messages, viewState]);

  const handleOptionClick = async (option: string) => {
    if (option === 'human') {
        if (!user) {
            alert('يجب تسجيل الدخول أولاً للتحدث مع خدمة العملاء');
            return;
        }
        await startSupportSession();
    } else {
        // Simple Bot Responses (Can be expanded)
    }
  };

  const startSupportSession = async () => {
      if (!user) return;
      setLoading(true);
      
      const newSession: Omit<SupportSession, 'id'> = {
          userId: user.id,
          userName: user.name,
          userEmail: user.email || '',
          status: 'queued',
          createdAt: new Date().toISOString(),
          messages: [{
              id: Date.now().toString(),
              senderId: 'system',
              senderName: 'System',
              text: 'أنت الآن متصل مع خدمة العملاء',
              timestamp: Date.now(),
              role: 'system'
          }]
      };

      await addDoc(collection(db, "support_chats"), newSession);
      setLoading(false);
  };

  const sendMessage = async () => {
      if (!input.trim() || !activeSession || !user) return;
      
      const msgText = input.trim();
      setInput('');

      const newMessage: ChatMessage = {
          id: Date.now().toString(),
          senderId: user.id,
          senderName: user.name,
          text: msgText,
          timestamp: Date.now(),
          role: 'user'
      };

      await updateDoc(doc(db, "support_chats", activeSession.id), {
          messages: arrayUnion(newMessage)
      });
  };

  // Render Functions
  const renderBotView = () => (
      <div className="p-6 space-y-4">
          <div className="text-center mb-6">
              <div className="w-16 h-16 bg-teal-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bot size={32} className="text-teal-500" />
              </div>
              <h3 className="text-white font-bold text-lg">مرحباً بك في خدمة العملاء الآلية</h3>
              <p className="text-slate-400 text-sm">كيف يمكننا مساعدتك اليوم؟</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
              <button className="bg-slate-700/50 hover:bg-slate-700 p-4 rounded-xl text-right text-slate-200 transition-colors border border-slate-600/50">
                  📦 استفسار عن طلب
              </button>
              <button className="bg-slate-700/50 hover:bg-slate-700 p-4 rounded-xl text-right text-slate-200 transition-colors border border-slate-600/50">
                  💳 مشاكل في الدفع
              </button>
              <button className="bg-slate-700/50 hover:bg-slate-700 p-4 rounded-xl text-right text-slate-200 transition-colors border border-slate-600/50">
                  🎮 طريقة شحن الألعاب
              </button>
              <button 
                onClick={() => handleOptionClick('human')}
                className="bg-teal-600 hover:bg-teal-700 p-4 rounded-xl text-center text-white font-bold transition-colors shadow-lg shadow-teal-500/20 mt-2"
              >
                  🎧 تواصل مع خدمة العملاء
              </button>
          </div>
      </div>
  );

  const renderQueueView = () => (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <div className="relative mb-6">
              <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center animate-pulse">
                  <Clock size={40} className="text-yellow-500" />
              </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">برجاء الانتظار...</h3>
          <p className="text-slate-400 mb-6 leading-relaxed">
              سيتواصل معك أحد ممثلي خدمة العملاء قريباً.
              <br/>
              نقدر صبركم.
          </p>
          <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden max-w-[200px]">
              <div className="h-full bg-teal-500 animate-loading-bar"></div>
          </div>
      </div>
  );

  const renderChatView = () => (
      <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
               {activeSession?.messages.map((msg, idx) => {
                   if (msg.role === 'system') {
                       return (
                           <div key={idx} className="flex justify-center my-2">
                               <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded-full border border-slate-700">
                                   {msg.text}
                               </span>
                           </div>
                       );
                   }
                   const isMe = msg.role === 'user';
                   return (
                       <div key={idx} className={`flex ${isMe ? 'justify-start' : 'justify-end'}`}>
                           <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                               isMe 
                               ? 'bg-teal-600 text-white rounded-tr-none' 
                               : 'bg-slate-700 text-slate-200 rounded-tl-none'
                           }`}>
                               {!isMe && <div className="text-[10px] text-teal-300 font-bold mb-1">{msg.senderName}</div>}
                               {msg.text}
                               <div className={`text-[9px] mt-1 opacity-60 ${isMe ? 'text-teal-100' : 'text-slate-400'} text-left ltr-text`}>
                                   {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                               </div>
                           </div>
                       </div>
                   );
               })}
               <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-slate-800 border-t border-slate-700 flex gap-2">
              <input 
                  type="text" 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder="اكتب رسالتك..."
                  className="flex-1 bg-slate-900 border border-slate-600 rounded-xl px-4 py-2 text-white focus:border-teal-500 outline-none"
              />
              <button 
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white p-2.5 rounded-xl transition-colors"
              >
                  <Send size={18} className="rtl:rotate-180" />
              </button>
          </div>
      </div>
  );

  return (
    <>
      {/* Overlay background on mobile when open */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Chat Window */}
      <div 
        className={`fixed bottom-0 md:bottom-4 left-0 md:left-4 z-[160] w-full md:w-[380px] bg-[#1e293b] rounded-t-3xl md:rounded-3xl shadow-2xl border-t md:border border-slate-700 flex flex-col transition-all duration-300 origin-bottom-left overflow-hidden ${
            isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-10 pointer-events-none'
        }`}
        style={{ height: '550px', maxHeight: '85vh' }}
      >
        {/* Header */}
        <div className="bg-slate-800 p-4 flex justify-between items-center border-b border-slate-700 relative">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${viewState === 'chat' ? 'bg-green-500/20 text-green-400' : 'bg-teal-500/20 text-teal-400'}`}>
                    {viewState === 'chat' ? <User size={20} /> : <Headset size={20} />}
                </div>
                <div>
                    <h3 className="font-bold text-white text-sm">
                        {viewState === 'chat' && activeSession?.adminName 
                            ? activeSession.adminName 
                            : 'خدمة العملاء'}
                    </h3>
                    <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${viewState === 'chat' ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`}></span>
                        <span className="text-xs text-slate-400">
                            {viewState === 'chat' ? 'متصل الآن' : viewState === 'queue' ? 'جاري الاتصال...' : 'دعم فني'}
                        </span>
                    </div>
                </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white bg-slate-700/50 p-2 rounded-full hover:bg-slate-700 transition-colors">
                <X size={18} />
            </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-[#0f172a] relative overflow-hidden">
            {viewState === 'bot' && renderBotView()}
            {viewState === 'queue' && renderQueueView()}
            {viewState === 'chat' && renderChatView()}
        </div>
      </div>
      
      <style>{`
          @keyframes loading-bar {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(200%); }
          }
          .animate-loading-bar {
              animation: loading-bar 1.5s infinite linear;
          }
      `}</style>
    </>
  );
};

export default CustomerSupport;
