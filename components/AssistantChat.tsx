
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from '../types';

interface AssistantChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const AssistantChat: React.FC<AssistantChatProps> = ({ isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{role: string, text: string}[]>([
    { role: 'model', text: 'مرحباً بك في FILEX Store! 🌊\nكيف يمكنني مساعدتك اليوم بخصوص شحن الألعاب أو البطاقات؟' }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
        scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || !process.env.API_KEY) return;

    const userMsg = input.trim();
    setInput('');
    // Store only plain objects to avoid circular references in state serialization
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const modelName = 'gemini-3-flash-preview';
      
      const systemPrompt = `
        You are a helpful customer support assistant for "FILEX Store", a digital goods store selling game top-ups (PUBG, Free Fire, etc.) and gift cards (PlayStation, iTunes, etc.).
        Answer in Arabic. Be polite, concise, and helpful.
        If asked about shipping, explain that delivery is instant via email or in-app code.
        If asked about payment, mention we accept Visa, MasterCard, and local wallets.
      `;

      const result = await ai.models.generateContent({
        model: modelName,
        contents: [
            { role: 'user', parts: [{ text: systemPrompt + "\n\nUser Question: " + userMsg }] }
        ]
      });

      // Safely extract the text. Do not store the whole result object.
      const responseText = result.text ? String(result.text).trim() : "عذراً، لم أستطع فهم ذلك تماماً. هل يمكنك إعادة صياغة سؤالك؟";
      
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);

    } catch (error: any) {
      // Avoid logging full error objects which might have circular references
      console.error("Assistant API Error"); 
      setMessages(prev => [...prev, { role: 'model', text: 'عذراً، لا يمكنني الرد حالياً. يرجى التحقق من الاتصال.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Overlay background on mobile when open */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Chat Window */}
      <div 
        className={`fixed bottom-0 md:bottom-4 left-0 md:left-4 z-50 w-full md:w-[350px] bg-[#1e293b] rounded-t-2xl md:rounded-2xl shadow-2xl border-t md:border border-slate-700 flex flex-col transition-all duration-300 origin-bottom-left ${
            isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-10 pointer-events-none'
        }`}
        style={{ height: '500px', maxHeight: '80vh' }}
      >
        {/* Header */}
        <div className="bg-slate-800 p-4 rounded-t-2xl flex justify-between items-center border-b border-slate-700">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400">
                    <Bot size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-white text-sm">مساعد FILEX الذكي</h3>
                    <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-xs text-slate-400">متصل الآن</span>
                    </div>
                </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
                <X size={20} />
            </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user' 
                        ? 'bg-teal-600 text-white rounded-tr-none' 
                        : 'bg-slate-700 text-slate-200 rounded-tl-none'
                    }`}>
                        {msg.text}
                    </div>
                </div>
            ))}
             {loading && (
                <div className="flex justify-end">
                    <div className="bg-slate-700 p-3 rounded-2xl rounded-tl-none flex gap-1">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-slate-700 bg-slate-800/50 rounded-b-2xl">
            <div className="flex gap-2">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="اكتب سؤالك هنا..."
                    className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-teal-500"
                />
                <button 
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="bg-teal-500 hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-xl transition-colors"
                >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="rtl:rotate-180" />}
                </button>
            </div>
        </div>
      </div>
    </>
  );
};

export default AssistantChat;
