
import React, { useState } from 'react';
import { Notification, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { Bell, ArrowRight, ArrowLeft, Mail, Info, CheckCircle, AlertTriangle, Heart } from 'lucide-react';
import { db } from '../firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, increment, setDoc } from 'firebase/firestore';

interface NotificationsPageProps {
    notifications: Notification[];
    onBack: () => void;
    lang: Language;
    onMarkAsRead: (id: string) => void;
    onMarkAllRead: () => void;
    userId: string;
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({ notifications, onBack, lang, onMarkAsRead, onMarkAllRead, userId }) => {
    const [activeTab, setActiveTab] = useState<'official' | 'system'>('official');
    const t = TRANSLATIONS[lang];

    const filteredNotifications = notifications.filter(n => n.type === activeTab).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Auto mark as read when clicking a specific notification
    const handleNotificationClick = (id: string, read: boolean) => {
        if (!read) {
            onMarkAsRead(id);
        }
    };

    const toggleLike = async (e: React.MouseEvent, notif: Notification) => {
        e.stopPropagation(); // Prevent triggering notification click
        if (notif.type !== 'official') return;

        const notifRef = doc(db, 'official_notifications', notif.id);
        const isLiked = notif.likedBy?.includes(userId);

        try {
            if (isLiked) {
                await updateDoc(notifRef, {
                    likes: increment(-1),
                    likedBy: arrayRemove(userId)
                });
            } else {
                // Use setDoc with merge to safely handle likes even if doc sync is lagging
                await setDoc(notifRef, {
                    likes: increment(1),
                    likedBy: arrayUnion(userId)
                }, { merge: true });
            }
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    };

    return (
        <div className="px-4 pb-20 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between py-6">
                <div className="flex items-center gap-3">
                    <button 
                    onClick={onBack}
                    className="bg-slate-800 p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                    {lang === 'ar' ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
                    </button>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Bell className="text-teal-500" /> {t.notifications}
                    </h2>
                </div>
                <button 
                    onClick={onMarkAllRead}
                    className="text-xs text-teal-400 hover:text-teal-300 font-bold"
                >
                    {t.mark_all_read}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-900 p-1.5 rounded-2xl mb-6 shadow-inner">
                <button 
                    onClick={() => setActiveTab('official')}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'official' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    <Mail size={16} /> {t.official_messages}
                    {notifications.filter(n => n.type === 'official' && !n.read).length > 0 && (
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    )}
                </button>
                <button 
                    onClick={() => setActiveTab('system')}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'system' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    <Info size={16} /> {t.system_messages}
                    {notifications.filter(n => n.type === 'system' && !n.read).length > 0 && (
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    )}
                </button>
            </div>

            {/* List */}
            <div className="space-y-4">
                {filteredNotifications.length > 0 ? (
                    filteredNotifications.map(notification => {
                        const isLiked = notification.likedBy?.includes(userId);
                        
                        return (
                            <div 
                                key={notification.id} 
                                onClick={() => handleNotificationClick(notification.id, notification.read)}
                                className={`relative bg-slate-800/50 border rounded-2xl p-4 transition-all cursor-pointer overflow-hidden pb-12 ${notification.read ? 'border-slate-700/50 opacity-80' : 'border-teal-500/30 bg-slate-800 shadow-lg'}`}
                            >
                                {!notification.read && (
                                    <div className="absolute top-4 left-4 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)] z-20"></div>
                                )}

                                {/* Image if available (Official messages usually) */}
                                {notification.image && (
                                    <div className="w-full h-40 rounded-xl overflow-hidden mb-4 border border-slate-700">
                                        <img src={notification.image} alt="Notification" className="w-full h-full object-cover" />
                                    </div>
                                )}

                                <div className="flex items-start gap-3">
                                    <div className={`mt-1 p-2 rounded-full shrink-0 ${notification.type === 'official' ? 'bg-teal-500/10 text-teal-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                        {notification.type === 'official' ? <Mail size={20} /> : <Info size={20} />}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`font-bold text-lg mb-1 ${notification.read ? 'text-slate-300' : 'text-white'}`}>{notification.title}</h3>
                                        <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">{notification.body}</p>
                                    </div>
                                </div>

                                {/* Absolute Footer for Date and Like Button */}
                                
                                {/* Date on Bottom Left */}
                                <div className="absolute bottom-4 left-4 text-[10px] text-slate-600 font-mono ltr-text">
                                    {new Date(notification.date).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                                </div>

                                {/* Like Button on Bottom Right */}
                                {notification.type === 'official' && (
                                    <button 
                                        onClick={(e) => toggleLike(e, notification)}
                                        className={`absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-xs font-bold border z-10 ${
                                            isLiked 
                                            ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20' 
                                            : 'bg-slate-700/50 text-slate-400 border-slate-600/50 hover:bg-slate-700 hover:text-white'
                                        }`}
                                    >
                                        <Heart size={16} fill={isLiked ? "currentColor" : "none"} className={isLiked ? "animate-bounce-short" : ""} />
                                        <span>{notification.likes || 0}</span>
                                    </button>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center text-slate-500 py-20 opacity-50">
                        <Bell size={64} className="mb-4 text-slate-600" strokeWidth={1} />
                        <p className="text-lg font-medium">{t.no_notifications}</p>
                    </div>
                )}
            </div>
            
            <style>{`
                @keyframes bounce-short {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.3); }
                }
                .animate-bounce-short {
                    animation: bounce-short 0.3s ease-in-out;
                }
            `}</style>
        </div>
    );
};

export default NotificationsPage;
