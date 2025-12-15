
import React, { useState, useRef, useEffect } from 'react';
import { User, Product, Category, Order, BannerData, NewsItem, SupportSession, ChatMessage } from '../types';
import { Package, TrendingUp, Trash2, Plus, Settings, Save, Megaphone, Layers, Upload, Check, Users, Ban, DollarSign, FileText, Smartphone, X, Shield, Key, Star, Loader2, Image as ImageIcon, Layout, MinusCircle, UserX, Search, Mail, Send, Headset, MessageSquare, Wallet } from 'lucide-react';
import { createNewAdminUser } from '../auth';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, setDoc, getDocs, addDoc, query, where, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';

interface AdminDashboardProps {
  currentUser: User;
  currentTicker: string;
  onUpdateTicker: (msg: string) => void;
  products: Product[];
  categories: Category[];
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: 'pending' | 'completed' | 'rejected') => void;
  whatsAppNumber: string;
  onUpdateWhatsApp: (num: string) => void;
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onAddCategory: (category: Category) => void;
  onDeleteCategory: (id: string) => void;
  onRefreshData: () => void;
  walletWhatsAppNumber: string;
  onUpdateWalletWhatsApp: (num: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
    currentUser, currentTicker, onUpdateTicker, 
    products, categories, orders, onUpdateOrderStatus, whatsAppNumber, onUpdateWhatsApp,
    onAddProduct, onDeleteProduct,
    onAddCategory, onDeleteCategory,
    walletWhatsAppNumber, onUpdateWalletWhatsApp
}) => {
  const [activeView, setActiveView] = useState<'overview' | 'users' | 'admins' | 'orders' | 'products' | 'categories' | 'settings' | 'banners' | 'news' | 'messages' | 'support'>('overview');
  
  // Search State
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Orders Filter State (Default 'pending' so processed orders disappear)
  const [orderFilter, setOrderFilter] = useState<'pending' | 'completed' | 'rejected' | 'all'>('pending');

  // Support Chat State
  const [supportSessions, setSupportSessions] = useState<SupportSession[]>([]);
  const [activeSupportChat, setActiveSupportChat] = useState<SupportSession | null>(null);
  const [supportMessageInput, setSupportMessageInput] = useState('');
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  // Settings State
  const [tickerInput, setTickerInput] = useState(currentTicker);
  const [whatsappInput, setWhatsappInput] = useState(whatsAppNumber);
  const [walletWhatsappInput, setWalletWhatsappInput] = useState(walletWhatsAppNumber);
  const [saveStatus, setSaveStatus] = useState('');

  // Add/Withdraw Funds Modal State
  const [showFundsModal, setShowFundsModal] = useState(false);
  const [selectedUserForFunds, setSelectedUserForFunds] = useState<string | null>(null);
  const [fundsAmount, setFundsAmount] = useState('');
  const [isDeposit, setIsDeposit] = useState(true); // true = deposit, false = withdraw

  // Admin Creation State
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [adminCreationStatus, setAdminCreationStatus] = useState('');

  // Real Users State from Firestore
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Banners & News State
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);

  // Messages / Broadcast State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcastImage, setBroadcastImage] = useState('');
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [broadcastStatus, setBroadcastStatus] = useState('');

  // Forms State
  const [showProductForm, setShowProductForm] = useState(false);
  // Default values removed as requested (exchangeRate: undefined, unitName: '')
  const [newProduct, setNewProduct] = useState<Partial<Product>>({ 
      name: '', 
      category: '', 
      image: '', 
      isFeatured: false, 
      exchangeRate: undefined, 
      unitName: '' 
  });
  
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', image: '', dataKey: '' });

  // Banner Form
  const [newBanner, setNewBanner] = useState({ title: '', subtitle: '', image: '' });
  const [showBannerForm, setShowBannerForm] = useState(false);

  // News Form
  const [newNews, setNewNews] = useState({ text: '', image: '' });
  const [showNewsForm, setShowNewsForm] = useState(false);

  // Refs for file inputs
  const productFileInputRef = useRef<HTMLInputElement>(null);
  const categoryFileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);
  const newsFileInputRef = useRef<HTMLInputElement>(null);
  const messageFileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Users, Banners, News, Support Chats
  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        setAllUsers(users);
    });
    
    const unsubBanners = onSnapshot(collection(db, "banners"), (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BannerData));
        setBanners(items);
    });

    const unsubNews = onSnapshot(collection(db, "news"), (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsItem));
        setNews(items);
    });

    const unsubSupport = onSnapshot(
        query(collection(db, "support_chats"), where("status", "in", ["queued", "active"])), 
        (snapshot) => {
            const chats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SupportSession));
            setSupportSessions(chats);
            
            // Update active chat live
            if (activeSupportChat) {
                const updated = chats.find(c => c.id === activeSupportChat.id);
                if (updated && updated.status !== 'closed') {
                    setActiveSupportChat(updated);
                } else if (!updated && activeSupportChat.status === 'active') {
                   // Chat closed remotely or status changed
                   setActiveSupportChat(null);
                }
            }
        }
    );

    return () => { unsubUsers(); unsubBanners(); unsubNews(); unsubSupport(); };
  }, [activeSupportChat?.id]); // Dependency to ensure active chat updates

  // Scroll active chat to bottom
  useEffect(() => {
      if (activeSupportChat) {
          chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
  }, [activeSupportChat?.messages]);

  // Update local state when props change
  useEffect(() => {
      setWhatsappInput(whatsAppNumber);
      setTickerInput(currentTicker);
      setWalletWhatsappInput(walletWhatsAppNumber);
  }, [whatsAppNumber, currentTicker, walletWhatsAppNumber]);

  // --- Helper: Send Notification ---
  const sendSystemNotification = async (userId: string, title: string, body: string) => {
      try {
          await addDoc(collection(db, "users", userId, "notifications"), {
              title,
              body,
              date: new Date().toISOString(),
              read: false,
              type: 'system'
          });
      } catch (e) {
          console.error("Failed to send system notification", e);
      }
  };

  const handleSaveSettings = () => {
    onUpdateTicker(tickerInput);
    onUpdateWhatsApp(whatsappInput);
    onUpdateWalletWhatsApp(walletWhatsappInput);
    setSaveStatus('تم الحفظ');
    setTimeout(() => setSaveStatus(''), 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Support Chat Actions ---
  const handleAcceptChat = async (chat: SupportSession) => {
      // Check if already taken to avoid race condition (basic check)
      if (chat.adminId && chat.adminId !== currentUser.id) {
          alert("تم استلام المحادثة بواسطة أدمن آخر");
          return;
      }
      
      await updateDoc(doc(db, "support_chats", chat.id), {
          status: 'active',
          adminId: currentUser.id,
          adminName: currentUser.name
      });
      
      const updatedChat = { ...chat, status: 'active', adminId: currentUser.id, adminName: currentUser.name } as SupportSession;
      setActiveSupportChat(updatedChat);
  };

  const handleSendSupportMessage = async () => {
      if (!activeSupportChat || !supportMessageInput.trim()) return;
      
      const msg: ChatMessage = {
          id: Date.now().toString(),
          senderId: currentUser.id,
          senderName: currentUser.name,
          text: supportMessageInput.trim(),
          timestamp: Date.now(),
          role: 'admin'
      };
      
      setSupportMessageInput('');
      await updateDoc(doc(db, "support_chats", activeSupportChat.id), {
          messages: arrayUnion(msg)
      });
  };

  const handleEndChat = async () => {
      if (!activeSupportChat) return;
      if (window.confirm("هل أنت متأكد من إنهاء المحادثة؟")) {
          await updateDoc(doc(db, "support_chats", activeSupportChat.id), {
              status: 'closed'
          });
          setActiveSupportChat(null);
      }
  };


  // --- Product & Category Submissions ---
  const submitProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.category || !newProduct.image) return;
    onAddProduct({
        id: Date.now().toString(),
        name: newProduct.name!,
        category: newProduct.category!,
        image: newProduct.image!,
        bgColor: 'from-slate-700 to-slate-900',
        isFeatured: newProduct.isFeatured,
        exchangeRate: newProduct.exchangeRate || 0,
        unitName: newProduct.unitName || ''
    });
    // Reset to empty values
    setNewProduct({ name: '', category: '', image: '', isFeatured: false, exchangeRate: undefined, unitName: '' });
    setShowProductForm(false);
  };

  const toggleFeatured = (product: Product) => {
      const docRef = doc(db, "products", product.id);
      updateDoc(docRef, { isFeatured: !product.isFeatured });
  };

  const submitCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name || !newCategory.image) return;
    onAddCategory({
        id: Date.now().toString(),
        name: newCategory.name,
        image: newCategory.image,
        dataKey: newCategory.dataKey || newCategory.name, 
        bgColor: 'luxury-black'
    });
    setNewCategory({ name: '', image: '', dataKey: '' });
    setShowCategoryForm(false);
  };

  // --- Banner & News Submissions ---
  const submitBanner = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newBanner.image) return;
      const id = Date.now().toString();
      await setDoc(doc(db, "banners", id), { ...newBanner, id });
      setNewBanner({ title: '', subtitle: '', image: '' });
      setShowBannerForm(false);
  };

  const deleteBanner = async (id: string) => {
      await deleteDoc(doc(db, "banners", id));
  };

  const submitNews = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newNews.image || !newNews.text) return;
      const id = Date.now().toString();
      await setDoc(doc(db, "news", id), { ...newNews, id });
      setNewNews({ text: '', image: '' });
      setShowNewsForm(false);
  };

  const deleteNews = async (id: string) => {
      await deleteDoc(doc(db, "news", id));
  };


  // --- User Management Actions ---
  const handleDeleteUser = async (uid: string) => {
      if (window.confirm('هل أنت متأكد من حذف هذا المستخدم نهائياً؟')) {
         await deleteDoc(doc(db, "users", uid));
      }
  };

  const toggleUserBan = async (uid: string, currentStatus: boolean | undefined) => {
      await updateDoc(doc(db, "users", uid), { isBanned: !currentStatus });
  };

  const openFundsModal = (uid: string) => {
      setSelectedUserForFunds(uid);
      setFundsAmount('');
      setIsDeposit(true);
      setShowFundsModal(true);
  };

  const confirmFundsTransaction = async () => {
      if (!selectedUserForFunds || !fundsAmount) return;
      const amount = parseFloat(fundsAmount);
      if (isNaN(amount) || amount <= 0) return;
      
      const user = allUsers.find(u => u.id === selectedUserForFunds);
      if (user) {
          let newBalance = user.balance || 0;
          let notifTitle = '';
          let notifBody = '';

          if (isDeposit) {
              newBalance += amount;
              notifTitle = 'تم إضافة رصيد';
              notifBody = `تم شحن رصيدك بمبلغ $${amount} بنجاح. رصيدك الحالي: $${newBalance.toFixed(2)}`;
          } else {
              newBalance -= amount;
              if (newBalance < 0) newBalance = 0;
              notifTitle = 'تم خصم رصيد';
              notifBody = `تم سحب مبلغ $${amount} من رصيدك. رصيدك الحالي: $${newBalance.toFixed(2)}`;
          }
          await updateDoc(doc(db, "users", selectedUserForFunds), { balance: newBalance });
          
          // Send System Notification
          await sendSystemNotification(selectedUserForFunds, notifTitle, notifBody);
      }
      setShowFundsModal(false);
  };

  // --- Order Management Actions ---
  const handleUpdateOrder = async (orderId: string, status: 'pending' | 'completed' | 'rejected') => {
      // 1. Update the status in Firestore immediately
      onUpdateOrderStatus(orderId, status);
      
      // 2. Find the order details from the current list (before filter removes it from view if filter is active)
      const order = orders.find(o => o.id === orderId);
      if (order) {
          let title = '';
          let body = '';
          
          if (status === 'completed') {
              title = '✅ تم قبول طلبك';
              body = `تهانينا! تم تنفيذ طلبك (${order.productName}) بنجاح.\nالكمية: ${order.quantity}`;
          } else if (status === 'rejected') {
              title = '❌ تم رفض طلبك';
              body = `عذراً، تم رفض طلبك (${order.productName}).\nيرجى التواصل مع الدعم الفني للاستفسار.`;
          }

          if (title && body) {
              // 3. Find the user robustly
              // order.userId stores the CustomID (e.g. "10050") as a string.
              // We compare it with user.customId (converted to string).
              // We also check user.id just in case legacy data stored the Auth UID.
              const targetUser = allUsers.find(u => 
                  String(u.customId) === String(order.userId) || u.id === order.userId
              );

              if (targetUser) {
                  await sendSystemNotification(targetUser.id, title, body);
              } else {
                  console.error("User not found for notification:", order.userId);
              }
          }
      }
  };

  // --- Broadcast Message Action ---
  const handleSendBroadcast = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!broadcastTitle || !broadcastBody) return;
      setBroadcastSending(true);
      setBroadcastStatus('جاري الإرسال...');

      try {
          // Get all users
          const usersSnapshot = await getDocs(collection(db, "users"));
          
          // Create a batch of promises to write notifications
          const promises = usersSnapshot.docs.map(userDoc => {
              return addDoc(collection(db, "users", userDoc.id, "notifications"), {
                  title: broadcastTitle,
                  body: broadcastBody,
                  image: broadcastImage || null,
                  date: new Date().toISOString(),
                  read: false,
                  type: 'official'
              });
          });

          await Promise.all(promises);

          setBroadcastStatus('تم إرسال الرسالة لجميع المستخدمين بنجاح!');
          setBroadcastTitle('');
          setBroadcastBody('');
          setBroadcastImage('');
      } catch (error) {
          console.error("Broadcast error:", error);
          setBroadcastStatus('حدث خطأ أثناء الإرسال.');
      } finally {
          setBroadcastSending(false);
          setTimeout(() => setBroadcastStatus(''), 4000);
      }
  };

  // --- Admin Management Actions ---
  const removeAdminPrivilege = async (uid: string) => {
     if (window.confirm('هل أنت متأكد من إزالة صلاحيات المشرف؟ سيصبح مستخدماً عادياً.')) {
         await updateDoc(doc(db, "users", uid), { isAdmin: false });
     }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
      e.preventDefault();
      setAdminCreationStatus('جاري الإنشاء...');
      
      const res = await createNewAdminUser(newAdminEmail, newAdminPass, newAdminName);
      
      if (res.success) {
          setAdminCreationStatus('تم إنشاء حساب المشرف بنجاح!');
          setNewAdminEmail('');
          setNewAdminPass('');
          setNewAdminName('');
      } else {
          setAdminCreationStatus('خطأ: ' + res.message);
      }
      setTimeout(() => setAdminCreationStatus(''), 3000);
  };

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg flex items-center gap-4">
      <div className={`p-4 rounded-xl ${color} bg-opacity-20 text-white shrink-0`}>
        <Icon size={24} />
      </div>
      <div>
        <h3 className="text-slate-400 text-sm mb-1">{title}</h3>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="الطلبات" value={orders.length} icon={FileText} color="bg-teal-500" />
        <StatCard title="المستخدمين" value={allUsers.length} icon={Users} color="bg-blue-500" />
        <StatCard title="المنتجات" value={products.length} icon={Package} color="bg-purple-500" />
      </div>
    </div>
  );

  const renderSupport = () => {
      // Logic: Show queued chats and active chats assigned to current admin
      const pendingChats = supportSessions.filter(c => c.status === 'queued');
      const myActiveChats = supportSessions.filter(c => c.status === 'active' && c.adminId === currentUser.id);

      if (activeSupportChat) {
          return (
              <div className="bg-slate-800 rounded-2xl border border-slate-700 h-[600px] flex flex-col overflow-hidden">
                  <div className="bg-slate-900 p-4 border-b border-slate-700 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                          <button onClick={() => setActiveSupportChat(null)} className="md:hidden text-slate-400"><X size={20}/></button>
                          <div className="w-10 h-10 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center">
                              <Headset size={20} />
                          </div>
                          <div>
                              <h3 className="font-bold text-white">{activeSupportChat.userName}</h3>
                              <p className="text-xs text-slate-400 font-mono">ID: {allUsers.find(u => u.id === activeSupportChat.userId)?.customId || 'Unknown'}</p>
                          </div>
                      </div>
                      <button 
                        onClick={handleEndChat} 
                        className="bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                      >
                          إنهاء المحادثة
                      </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
                      {activeSupportChat.messages.map((msg, idx) => {
                           if (msg.role === 'system') return (
                               <div key={idx} className="flex justify-center"><span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-500">{msg.text}</span></div>
                           );
                           
                           const isMe = msg.role === 'admin';
                           return (
                               <div key={idx} className={`flex ${isMe ? 'justify-start' : 'justify-end'}`}>
                                   <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${isMe ? 'bg-slate-700 text-slate-200' : 'bg-teal-600 text-white'}`}>
                                       {msg.text}
                                       <div className="text-[9px] opacity-50 mt-1 text-left ltr-text">
                                           {new Date(msg.timestamp).toLocaleTimeString()}
                                       </div>
                                   </div>
                               </div>
                           );
                      })}
                      <div ref={chatMessagesEndRef} />
                  </div>

                  <div className="p-4 bg-slate-900 border-t border-slate-700 flex gap-2">
                      <input 
                          type="text" 
                          value={supportMessageInput}
                          onChange={e => setSupportMessageInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleSendSupportMessage()}
                          className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-2 text-white focus:border-teal-500 outline-none"
                          placeholder="اكتب ردك هنا..."
                      />
                      <button onClick={handleSendSupportMessage} className="bg-teal-500 hover:bg-teal-600 text-white p-3 rounded-xl">
                          <Send size={18} className="rtl:rotate-180" />
                      </button>
                  </div>
              </div>
          );
      }

      return (
          <div className="space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Headset className="text-teal-500" /> طلبات المحادثة
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Pending Queue */}
                  <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
                      <h4 className="text-white font-bold mb-4 border-b border-slate-700 pb-2 flex justify-between">
                          قيد الانتظار <span className="bg-yellow-500 text-black text-xs px-2 rounded-full flex items-center">{pendingChats.length}</span>
                      </h4>
                      {pendingChats.length === 0 ? (
                          <div className="text-center py-8 text-slate-500">لا توجد طلبات جديدة</div>
                      ) : (
                          <div className="space-y-2">
                              {pendingChats.map(chat => (
                                  <div key={chat.id} className="bg-slate-900 p-3 rounded-xl border border-slate-700 flex justify-between items-center">
                                      <div>
                                          <div className="font-bold text-white">{chat.userName}</div>
                                          <div className="text-xs text-slate-500">{new Date(chat.createdAt).toLocaleTimeString()}</div>
                                      </div>
                                      <button onClick={() => handleAcceptChat(chat)} className="bg-teal-500 hover:bg-teal-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold">
                                          قبول
                                      </button>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>

                  {/* My Active Chats */}
                  <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
                      <h4 className="text-white font-bold mb-4 border-b border-slate-700 pb-2 flex justify-between">
                          محادثاتي النشطة <span className="bg-green-500 text-black text-xs px-2 rounded-full flex items-center">{myActiveChats.length}</span>
                      </h4>
                      {myActiveChats.length === 0 ? (
                          <div className="text-center py-8 text-slate-500">لا توجد محادثات نشطة</div>
                      ) : (
                          <div className="space-y-2">
                              {myActiveChats.map(chat => (
                                  <div key={chat.id} className="bg-slate-900 p-3 rounded-xl border border-slate-700 flex justify-between items-center cursor-pointer hover:border-teal-500/50" onClick={() => setActiveSupportChat(chat)}>
                                      <div>
                                          <div className="font-bold text-white">{chat.userName}</div>
                                          <div className="text-xs text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> جاري المحادثة</div>
                                      </div>
                                      <div className="bg-slate-800 p-2 rounded-full text-slate-400">
                                          <MessageSquare size={16} />
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              </div>
          </div>
      );
  };

  const renderMessages = () => (
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 min-h-[500px]">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Mail className="text-teal-500" /> إرسال رسائل رسمية
          </h3>
          <p className="text-slate-400 text-sm mb-6 bg-slate-900/50 p-3 rounded-xl border border-slate-700">
              استخدم هذه الواجهة لإرسال إشعار عام لجميع مستخدمي الموقع. سيظهر الإشعار في خانة "الرسائل الرسمية" لدى الجميع.
          </p>

          <form onSubmit={handleSendBroadcast} className="space-y-4 max-w-2xl">
              <div>
                  <label className="block text-slate-300 text-sm mb-1 font-bold">عنوان الرسالة</label>
                  <input 
                      type="text" 
                      required 
                      value={broadcastTitle} 
                      onChange={e => setBroadcastTitle(e.target.value)} 
                      className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-teal-500 outline-none"
                      placeholder="مثال: خصم خاص، صيانة، تحديث جديد..."
                  />
              </div>

              <div>
                  <label className="block text-slate-300 text-sm mb-1 font-bold">نص الرسالة</label>
                  <textarea 
                      required 
                      value={broadcastBody} 
                      onChange={e => setBroadcastBody(e.target.value)} 
                      className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-teal-500 outline-none h-32 resize-none"
                      placeholder="اكتب محتوى الرسالة هنا..."
                  />
              </div>

              <div>
                  <label className="block text-slate-300 text-sm mb-1 font-bold">صورة (اختياري)</label>
                  <input type="file" accept="image/*" ref={messageFileInputRef} className="hidden" onChange={(e) => handleImageUpload(e, setBroadcastImage)} />
                  <div onClick={() => messageFileInputRef.current?.click()} className="w-full h-32 bg-slate-900 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer flex flex-col items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
                        {broadcastImage ? <img src={broadcastImage} className="h-full object-contain" /> : <><Upload size={24} className="text-slate-400" /><span className="text-xs text-slate-400">اختر صورة</span></>}
                  </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                  <button 
                      type="submit" 
                      disabled={broadcastSending}
                      className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                      {broadcastSending ? <Loader2 className="animate-spin" /> : <Send size={18} className="rtl:rotate-180" />}
                      إرسال للجميع
                  </button>
                  {broadcastStatus && (
                      <span className={`font-bold ${broadcastStatus.includes('خطأ') ? 'text-red-400' : 'text-green-400'}`}>
                          {broadcastStatus}
                      </span>
                  )}
              </div>
          </form>
      </div>
  );

  const renderUsers = () => {
    const filteredUsers = allUsers.filter(u => 
      u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
      u.email?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.customId.toString().includes(userSearchQuery)
    );

    return (
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white">إدارة المستخدمين</h3>
          <div className="relative">
             <input 
               type="text" 
               placeholder="بحث..." 
               value={userSearchQuery}
               onChange={(e) => setUserSearchQuery(e.target.value)}
               className="bg-slate-900 border border-slate-600 rounded-lg py-1 px-3 text-sm text-white focus:outline-none focus:border-teal-500"
             />
             <Search size={14} className="absolute left-2 top-2 text-slate-500" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-900 text-slate-400 border-b border-slate-700">
              <tr>
                <th className="py-3 px-4">المستخدم</th>
                <th className="py-3 px-4">الرصيد</th>
                <th className="py-3 px-4">الحالة</th>
                <th className="py-3 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="text-slate-200">
              {filteredUsers.map(u => (
                <tr key={u.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="py-3 px-4">
                    <div className="font-bold">{u.name}</div>
                    <div className="text-xs text-slate-500">{u.email || u.phone}</div>
                    <div className="text-[10px] text-slate-600 font-mono">ID: {u.customId}</div>
                  </td>
                  <td className="py-3 px-4 font-bold text-green-400">${u.balance.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    {u.isBanned ? <span className="text-red-500 bg-red-500/10 px-2 py-0.5 rounded text-xs border border-red-500/20">محظور</span> : <span className="text-green-500 bg-green-500/10 px-2 py-0.5 rounded text-xs border border-green-500/20">نشط</span>}
                  </td>
                  <td className="py-3 px-4 flex justify-center gap-2">
                    <button onClick={() => openFundsModal(u.id)} className="p-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600 hover:text-white transition-colors" title="شحن/سحب"><DollarSign size={16}/></button>
                    <button onClick={() => toggleUserBan(u.id, u.isBanned)} className="p-2 bg-yellow-600/20 text-yellow-400 rounded-lg hover:bg-yellow-600 hover:text-white transition-colors" title="حظر/فك حظر"><Ban size={16}/></button>
                    <button onClick={() => handleDeleteUser(u.id)} className="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition-colors" title="حذف"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderAdmins = () => {
    const admins = allUsers.filter(u => u.isAdmin);
    return (
      <div className="space-y-6">
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
           <h3 className="text-lg font-bold text-white mb-4">إضافة مشرف جديد</h3>
           <form onSubmit={handleCreateAdmin} className="space-y-3 max-w-md">
             <input type="text" placeholder="الاسم" required value={newAdminName} onChange={e => setNewAdminName(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white text-sm focus:border-teal-500 outline-none" />
             <input type="email" placeholder="البريد الإلكتروني" required value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white text-sm focus:border-teal-500 outline-none" />
             <input type="password" placeholder="كلمة المرور" required value={newAdminPass} onChange={e => setNewAdminPass(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white text-sm focus:border-teal-500 outline-none" />
             <button type="submit" className="bg-teal-500 hover:bg-teal-600 text-white py-2 px-4 rounded-lg text-sm font-bold w-full transition-colors">إنشاء مشرف</button>
             {adminCreationStatus && <p className="text-xs text-slate-400 text-center">{adminCreationStatus}</p>}
           </form>
        </div>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
           <h3 className="text-lg font-bold text-white mb-4">قائمة المشرفين</h3>
           <div className="space-y-3">
             {admins.map(admin => (
               <div key={admin.id} className="flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-700">
                 <div>
                   <div className="font-bold text-white">{admin.name}</div>
                   <div className="text-xs text-slate-500">{admin.email}</div>
                 </div>
                 {currentUser.id !== admin.id && (
                   <button onClick={() => removeAdminPrivilege(admin.id)} className="text-red-400 hover:text-red-300 text-xs font-bold">إزالة</button>
                 )}
               </div>
             ))}
           </div>
        </div>
      </div>
    );
  };

  const renderOrders = () => {
    const filteredOrders = orderFilter === 'all' 
      ? orders 
      : orders.filter(o => o.status === orderFilter);

    return (
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
        <div className="flex justify-between items-center mb-6">
           <h3 className="text-lg font-bold text-white flex items-center gap-2"><FileText className="text-teal-500" /> إدارة الطلبات</h3>
           <div className="flex bg-slate-900 rounded-lg p-1">
              {(['pending', 'completed', 'rejected', 'all'] as const).map(f => (
                  <button 
                    key={f}
                    onClick={() => setOrderFilter(f)}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${orderFilter === f ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                      {f === 'pending' ? 'انتظار' : f === 'completed' ? 'مكتمل' : f === 'rejected' ? 'مرفوض' : 'الكل'}
                  </button>
              ))}
           </div>
        </div>

        <div className="space-y-4">
            {filteredOrders.length === 0 ? (
                <div className="text-center py-10 text-slate-500">لا توجد طلبات</div>
            ) : (
                filteredOrders.map(order => (
                    <div key={order.id} className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="font-bold text-white text-lg">{order.productName}</div>
                            <div className="text-sm text-slate-400">User: {order.userName} (ID: {order.userId})</div>
                            <div className="text-xs text-slate-500 font-mono mt-1">Player ID: <span className="text-teal-400 bg-slate-800 px-1 rounded select-all">{order.gameId}</span></div>
                            <div className="text-xs text-slate-600 mt-1">{new Date(order.date).toLocaleString('en-US')}</div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <div className="text-xs text-slate-500">الكمية</div>
                                <div className="font-bold text-white">{order.quantity}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xs text-slate-500">السعر</div>
                                <div className="font-bold text-green-400">${order.amountUSD}</div>
                            </div>
                        </div>

                        {order.status === 'pending' && (
                            <div className="flex gap-2 w-full md:w-auto">
                                <button onClick={() => handleUpdateOrder(order.id, 'completed')} className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-bold" title="قبول">
                                    <Check size={18} />
                                    <span>قبول</span>
                                </button>
                                <button onClick={() => handleUpdateOrder(order.id, 'rejected')} className="flex-1 md:flex-none bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-bold" title="رفض">
                                    <X size={18} />
                                    <span>رفض</span>
                                </button>
                            </div>
                        )}
                        {order.status !== 'pending' && (
                             <div className={`px-3 py-1 rounded text-xs font-bold ${order.status === 'completed' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                 {order.status === 'completed' ? 'مكتمل' : 'مرفوض'}
                             </div>
                        )}
                    </div>
                ))
            )}
        </div>
      </div>
    );
  };

  const renderProducts = () => (
      <div className="space-y-6">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2"><Package className="text-teal-500" /> المنتجات</h3>
                  <button onClick={() => setShowProductForm(!showProductForm)} className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                      <Plus size={16} /> إضافة منتج
                  </button>
              </div>

              {showProductForm && (
                  <form onSubmit={submitProduct} className="bg-slate-900 p-4 rounded-xl border border-slate-700 mb-6 animate-fade-in-up">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <input type="text" placeholder="اسم المنتج" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-teal-500 outline-none" />
                          <select required value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-teal-500 outline-none">
                              <option value="">اختر القسم</option>
                              {categories.map(c => <option key={c.id} value={c.dataKey}>{c.name}</option>)}
                          </select>
                          <input type="number" placeholder="سعر الصرف (كم وحدة مقابل 1$)" step="0.01" value={newProduct.exchangeRate || ''} onChange={e => setNewProduct({...newProduct, exchangeRate: parseFloat(e.target.value)})} className="bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-teal-500 outline-none" />
                          <input type="text" placeholder="اسم الوحدة (مثال: جوهرة، شدة)" value={newProduct.unitName || ''} onChange={e => setNewProduct({...newProduct, unitName: e.target.value})} className="bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-teal-500 outline-none" />
                      </div>
                      <div className="mb-4">
                          <input type="file" ref={productFileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, (img) => setNewProduct({...newProduct, image: img}))} />
                          <div onClick={() => productFileInputRef.current?.click()} className="w-full h-32 border-2 border-dashed border-slate-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors">
                              {newProduct.image ? <img src={newProduct.image} className="h-full object-contain" /> : <><Upload className="text-slate-400 mb-2" /><span className="text-slate-500 text-sm">رفع صورة</span></>}
                          </div>
                      </div>
                      <div className="flex items-center gap-2 mb-4">
                          <input type="checkbox" id="featured" checked={newProduct.isFeatured} onChange={e => setNewProduct({...newProduct, isFeatured: e.target.checked})} className="w-4 h-4 accent-teal-500" />
                          <label htmlFor="featured" className="text-slate-300 text-sm cursor-pointer">منتج مميز (يظهر في الصفحة الرئيسية)</label>
                      </div>
                      <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => setShowProductForm(false)} className="text-slate-400 hover:text-white px-4 py-2">إلغاء</button>
                          <button type="submit" className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg font-bold">حفظ</button>
                      </div>
                  </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map(p => (
                      <div key={p.id} className="bg-slate-900 border border-slate-700 rounded-xl p-3 flex gap-3 relative group">
                          <img src={p.image} className="w-16 h-16 rounded-lg object-cover bg-slate-800" />
                          <div className="flex-1">
                              <div className="font-bold text-white text-sm">{p.name}</div>
                              <div className="text-xs text-slate-500">{categories.find(c => c.dataKey === p.category)?.name || p.category}</div>
                              {p.exchangeRate && <div className="text-[10px] text-green-400 mt-1">1$ = {p.exchangeRate} {p.unitName}</div>}
                          </div>
                          <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => toggleFeatured(p)} className={`p-1.5 rounded-lg ${p.isFeatured ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-700 text-slate-400'}`}><Star size={14} fill={p.isFeatured ? "currentColor" : "none"} /></button>
                              <button onClick={() => onDeleteProduct(p.id)} className="p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white"><Trash2 size={14} /></button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );

  const renderCategories = () => (
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
          <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2"><Layers className="text-teal-500" /> الأقسام</h3>
              <button onClick={() => setShowCategoryForm(!showCategoryForm)} className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                  <Plus size={16} /> إضافة قسم
              </button>
          </div>

          {showCategoryForm && (
              <form onSubmit={submitCategory} className="bg-slate-900 p-4 rounded-xl border border-slate-700 mb-6 animate-fade-in-up">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input type="text" placeholder="اسم القسم" required value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value})} className="bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-teal-500 outline-none" />
                      <input type="text" placeholder="Data Key (English, no spaces)" required value={newCategory.dataKey} onChange={e => setNewCategory({...newCategory, dataKey: e.target.value})} className="bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-teal-500 outline-none" />
                  </div>
                  <div className="mb-4">
                      <input type="file" ref={categoryFileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, (img) => setNewCategory({...newCategory, image: img}))} />
                      <div onClick={() => categoryFileInputRef.current?.click()} className="w-full h-32 border-2 border-dashed border-slate-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors">
                          {newCategory.image ? <img src={newCategory.image} className="h-full object-contain" /> : <><Upload className="text-slate-400 mb-2" /><span className="text-slate-500 text-sm">رفع صورة</span></>}
                      </div>
                  </div>
                  <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setShowCategoryForm(false)} className="text-slate-400 hover:text-white px-4 py-2">إلغاء</button>
                      <button type="submit" className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg font-bold">حفظ</button>
                  </div>
              </form>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map(c => (
                  <div key={c.id} className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col items-center text-center relative group">
                      <img src={c.image} className="w-16 h-16 rounded-lg object-cover bg-slate-800 mb-3" />
                      <div className="font-bold text-white text-sm">{c.name}</div>
                      <button onClick={() => onDeleteCategory(c.id)} className="absolute top-2 left-2 p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                  </div>
              ))}
          </div>
      </div>
  );

  const renderSettings = () => (
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Settings className="text-teal-500" /> الإعدادات العامة</h3>
          
          <div className="space-y-6 max-w-2xl">
              <div>
                  <label className="block text-slate-300 text-sm mb-2 font-bold">شريط الأخبار المتحرك</label>
                  <input type="text" value={tickerInput} onChange={e => setTickerInput(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-teal-500 outline-none" />
              </div>
              
              <div>
                  <label className="block text-slate-300 text-sm mb-2 font-bold">رقم واتساب الطلبات (مع الرمز الدولي)</label>
                  <div className="relative">
                      <Smartphone className="absolute right-3 top-3.5 text-slate-500" size={18} />
                      <input type="text" value={whatsappInput} onChange={e => setWhatsappInput(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 pr-10 text-white focus:border-teal-500 outline-none" placeholder="201xxxxxxxxx" />
                  </div>
              </div>

              <div>
                  <label className="block text-slate-300 text-sm mb-2 font-bold">رقم واتساب شحن المحفظة</label>
                  <div className="relative">
                      <Wallet className="absolute right-3 top-3.5 text-slate-500" size={18} />
                      <input type="text" value={walletWhatsappInput} onChange={e => setWalletWhatsappInput(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 pr-10 text-white focus:border-teal-500 outline-none" placeholder="201xxxxxxxxx" />
                  </div>
              </div>

              <div className="flex items-center gap-4">
                  <button onClick={handleSaveSettings} className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded-xl font-bold transition-colors">حفظ التغييرات</button>
                  {saveStatus && <span className="text-green-400 font-bold animate-fade-in">{saveStatus}</span>}
              </div>
          </div>
      </div>
  );

  const renderBanners = () => (
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
          <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2"><ImageIcon className="text-teal-500" /> البنرات الإعلانية</h3>
              <button onClick={() => setShowBannerForm(!showBannerForm)} className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                  <Plus size={16} /> إضافة بنر
              </button>
          </div>

          {showBannerForm && (
              <form onSubmit={submitBanner} className="bg-slate-900 p-4 rounded-xl border border-slate-700 mb-6 animate-fade-in-up">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input type="text" placeholder="العنوان الرئيسي" value={newBanner.title} onChange={e => setNewBanner({...newBanner, title: e.target.value})} className="bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-teal-500 outline-none" />
                      <input type="text" placeholder="العنوان الفرعي" value={newBanner.subtitle} onChange={e => setNewBanner({...newBanner, subtitle: e.target.value})} className="bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-teal-500 outline-none" />
                  </div>
                  <div className="mb-4">
                      <input type="file" ref={bannerFileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, (img) => setNewBanner({...newBanner, image: img}))} />
                      <div onClick={() => bannerFileInputRef.current?.click()} className="w-full h-32 border-2 border-dashed border-slate-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors">
                          {newBanner.image ? <img src={newBanner.image} className="h-full object-contain" /> : <><Upload className="text-slate-400 mb-2" /><span className="text-slate-500 text-sm">رفع صورة (Landscape)</span></>}
                      </div>
                  </div>
                  <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setShowBannerForm(false)} className="text-slate-400 hover:text-white px-4 py-2">إلغاء</button>
                      <button type="submit" className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg font-bold">حفظ</button>
                  </div>
              </form>
          )}

          <div className="grid grid-cols-1 gap-4">
              {banners.map(b => (
                  <div key={b.id} className="relative w-full h-40 rounded-xl overflow-hidden group border border-slate-700">
                      <img src={b.image} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-end p-4">
                          <div>
                              <div className="font-bold text-white text-lg">{b.title}</div>
                              <div className="text-sm text-slate-300">{b.subtitle}</div>
                          </div>
                      </div>
                      <button onClick={() => deleteBanner(b.id)} className="absolute top-2 left-2 bg-red-500 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                  </div>
              ))}
          </div>
      </div>
  );

  const renderNews = () => (
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
          <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2"><Layout className="text-teal-500" /> أخبار وعروض</h3>
              <button onClick={() => setShowNewsForm(!showNewsForm)} className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                  <Plus size={16} /> إضافة خبر
              </button>
          </div>

          {showNewsForm && (
              <form onSubmit={submitNews} className="bg-slate-900 p-4 rounded-xl border border-slate-700 mb-6 animate-fade-in-up">
                  <div className="mb-4">
                      <input type="text" placeholder="نص الخبر" required value={newNews.text} onChange={e => setNewNews({...newNews, text: e.target.value})} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-teal-500 outline-none" />
                  </div>
                  <div className="mb-4">
                      <input type="file" ref={newsFileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, (img) => setNewNews({...newNews, image: img}))} />
                      <div onClick={() => newsFileInputRef.current?.click()} className="w-full h-32 border-2 border-dashed border-slate-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors">
                          {newNews.image ? <img src={newNews.image} className="h-full object-contain" /> : <><Upload className="text-slate-400 mb-2" /><span className="text-slate-500 text-sm">رفع صورة</span></>}
                      </div>
                  </div>
                  <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setShowNewsForm(false)} className="text-slate-400 hover:text-white px-4 py-2">إلغاء</button>
                      <button type="submit" className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg font-bold">حفظ</button>
                  </div>
              </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {news.map(n => (
                  <div key={n.id} className="relative h-40 rounded-xl overflow-hidden group border border-slate-700">
                      <img src={n.image} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                          <div className="font-bold text-white">{n.text}</div>
                      </div>
                      <button onClick={() => deleteNews(n.id)} className="absolute top-2 left-2 bg-red-500 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                  </div>
              ))}
          </div>
      </div>
  );

  return (
    <div className="px-4 py-6 pb-24 w-full overflow-hidden">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">لوحة التحكم</h1>
            <p className="text-slate-400 text-sm">مرحباً بك، {currentUser.name}</p>
        </div>
        <div className="bg-teal-500/10 text-teal-400 px-3 py-1 md:px-4 md:py-2 rounded-full border border-teal-500/20 text-xs md:text-sm font-bold">
            وضع المشرف
        </div>
      </div>

      {/* Admin Tabs - Mobile Friendly */}
      <div className="mb-8 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
        <div className="flex gap-2 min-w-max">
            {[
                { id: 'overview', icon: Settings, label: 'نظرة عامة' },
                { id: 'support', icon: Headset, label: 'الدعم الفني' },
                { id: 'messages', icon: Mail, label: 'الرسائل' },
                { id: 'orders', icon: FileText, label: 'الطلبات' },
                { id: 'users', icon: Users, label: 'المستخدمين' },
                { id: 'admins', icon: Shield, label: 'المشرفين' },
                { id: 'banners', icon: ImageIcon, label: 'البنرات' },
                { id: 'news', icon: Layout, label: 'الأخبار' },
                { id: 'categories', icon: Layers, label: 'الأقسام' },
                { id: 'products', icon: Package, label: 'المنتجات' },
                { id: 'settings', icon: Megaphone, label: 'الإعدادات' }
            ].map(tab => (
                <button 
                    key={tab.id}
                    onClick={() => setActiveView(tab.id as any)} 
                    className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${activeView === tab.id ? 'bg-teal-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                    <tab.icon size={16} /> {tab.label}
                    {tab.id === 'support' && supportSessions.filter(s => s.status === 'queued').length > 0 && (
                        <span className="bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                            {supportSessions.filter(s => s.status === 'queued').length}
                        </span>
                    )}
                </button>
            ))}
        </div>
      </div>

      <div className="animate-fade-in-up">
        {activeView === 'overview' && renderOverview()}
        {activeView === 'support' && renderSupport()}
        {activeView === 'users' && renderUsers()}
        {activeView === 'admins' && renderAdmins()}
        {activeView === 'orders' && renderOrders()}
        {activeView === 'categories' && renderCategories()}
        {activeView === 'products' && renderProducts()}
        {activeView === 'settings' && renderSettings()}
        {activeView === 'banners' && renderBanners()}
        {activeView === 'news' && renderNews()}
        {activeView === 'messages' && renderMessages()}
      </div>

      {/* Funds Modal */}
      {showFundsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowFundsModal(false)}></div>
            <div className="bg-slate-800 w-full max-w-sm rounded-3xl border border-slate-700 shadow-2xl relative p-6 animate-fade-in-up">
                <h3 className="text-xl font-bold text-white mb-4">{isDeposit ? 'شحن رصيد' : 'سحب رصيد'}</h3>
                
                <div className="flex bg-slate-900 rounded-xl p-1 mb-4">
                    <button onClick={() => setIsDeposit(true)} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${isDeposit ? 'bg-green-600 text-white' : 'text-slate-400 hover:text-white'}`}>إيداع</button>
                    <button onClick={() => setIsDeposit(false)} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${!isDeposit ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}>سحب</button>
                </div>

                <input 
                    type="number" 
                    value={fundsAmount}
                    onChange={(e) => setFundsAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl py-3 px-4 text-white font-bold mb-4 focus:border-teal-500 outline-none"
                    placeholder="المبلغ ($)"
                />
                <div className="flex gap-2 justify-end">
                    <button onClick={() => setShowFundsModal(false)} className="px-4 py-2 text-slate-400 hover:text-white">إلغاء</button>
                    <button onClick={confirmFundsTransaction} className={`px-6 py-2 text-white rounded-xl font-bold ${isDeposit ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}>
                        {isDeposit ? 'تأكيد الشحن' : 'تأكيد السحب'}
                    </button>
                </div>
            </div>
          </div>
      )}
    </div>
  );
};

export default AdminDashboard;
