
import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Banner from './components/Banner';
import ProductCard from './components/ProductCard';
import CustomerSupport from './components/CustomerSupport';
import OrderSuccessModal from './components/OrderSuccessModal';
import Auth from './components/Auth';
import Profile from './components/Profile';
import OrderHistoryPage from './components/OrderHistoryPage';
import AdminDashboard from './components/AdminDashboard';
import NotificationsPage from './components/NotificationsPage';
import Ticker from './components/Ticker';
import PrivacyPage from './components/PrivacyPage';
import AboutPage from './components/AboutPage';
import SnowfallEffect from './components/SnowfallEffect';
import { Product, Tab, User, Category, Order, BannerData, NewsItem, Language, Notification } from './types';
import { subscribeToAuthChanges, logoutUser, updateUserProfile } from './auth';
import { Layers, ChevronRight, Zap, X, DollarSign, Send, Search, Camera, Save, TrendingUp } from 'lucide-react';
import { db } from './firebase';
import { collection, onSnapshot, doc, updateDoc, query, orderBy, setDoc, deleteDoc, addDoc, writeBatch, arrayUnion } from 'firebase/firestore';
import { TRANSLATIONS } from './constants';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.HOME);
  const [notification, setNotification] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isSnowing, setIsSnowing] = useState(false); // حالة تساقط الثلج
  const [lang, setLang] = useState<Language>('ar');
  
  const t = TRANSLATIONS[lang];

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  
  const [privateNotifications, setPrivateNotifications] = useState<Notification[]>([]);
  const [publicNotifications, setPublicNotifications] = useState<Notification[]>([]);
  
  const [tickerMessage, setTickerMessage] = useState('');
  const [whatsAppNumber, setWhatsAppNumber] = useState('');
  const [walletWhatsAppNumber, setWalletWhatsAppNumber] = useState(''); 

  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [purchaseAmount, setPurchaseAmount] = useState<string>('1');
  const [gameIdInput, setGameIdInput] = useState('');

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [storeSearchQuery, setStoreSearchQuery] = useState('');

  const [isProfileSetupOpen, setIsProfileSetupOpen] = useState(false);
  const [setupName, setSetupName] = useState('');
  const [setupPhoto, setSetupPhoto] = useState('');
  const setupFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, "products"), (snapshot) => {
        const loadedProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(loadedProducts);
    });

    const unsubCategories = onSnapshot(collection(db, "categories"), (snapshot) => {
        const loadedCategories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
        setCategories(loadedCategories);
    });

    const ordersQuery = query(collection(db, "orders"), orderBy("date", "desc"));
    const unsubOrders = onSnapshot(ordersQuery, (snapshot) => {
        const loadedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        setOrders(loadedOrders);
    });

    const unsubBanners = onSnapshot(collection(db, "banners"), (snapshot) => {
        const loadedBanners = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BannerData));
        setBanners(loadedBanners);
    });

    const unsubNews = onSnapshot(collection(db, "news"), (snapshot) => {
        const loadedNews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsItem));
        setNews(loadedNews);
    });

    const unsubSettings = onSnapshot(doc(db, "settings", "global"), (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            setTickerMessage(data.ticker || 'مرحباً بكم في FILEX Store');
            setWhatsAppNumber(data.whatsapp || '');
            setWalletWhatsAppNumber(data.walletWhatsapp || '01027833873'); 
        }
    });

    const unsubOfficialNotifs = onSnapshot(query(collection(db, "official_notifications"), orderBy("date", "desc")), (snapshot) => {
        const loadedPublic = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'official', read: false } as Notification));
        setPublicNotifications(loadedPublic);
    });

    return () => {
        unsubProducts(); unsubCategories(); unsubOrders(); unsubSettings(); unsubBanners(); unsubNews(); unsubOfficialNotifs();
    };
  }, []);

  useEffect(() => {
    let unsubUserDoc: (() => void) | null = null;
    let unsubUserNotifs: (() => void) | null = null;

    const unsubscribeAuth = subscribeToAuthChanges((authUser) => {
      if (authUser) {
          unsubUserDoc = onSnapshot(doc(db, "users", authUser.id), (docSnap) => {
              if (docSnap.exists()) setUser({ ...authUser, ...docSnap.data() } as User);
              else setUser(authUser);
          });
          const notifQuery = query(collection(db, "users", authUser.id, "notifications"), orderBy("date", "desc"));
          unsubUserNotifs = onSnapshot(notifQuery, (snapshot) => {
              const loadedNotifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'system' } as Notification));
              setPrivateNotifications(loadedNotifs);
          });
      } else {
          if (unsubUserDoc) unsubUserDoc();
          if (unsubUserNotifs) unsubUserNotifs();
          setUser(null);
          setPrivateNotifications([]);
      }
      setAuthLoading(false);
    });
    return () => {
        unsubscribeAuth();
        if (unsubUserDoc) unsubUserDoc();
        if (unsubUserNotifs) unsubUserNotifs();
    };
  }, []);

  const allNotifications = [
      ...privateNotifications, 
      ...publicNotifications.map(n => ({ ...n, read: user?.readOfficial?.includes(n.id) || false }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  useEffect(() => {
    window.scrollTo(0, 0);
    if (activeTab !== Tab.STORE) {
      setSelectedCategory(null);
      setStoreSearchQuery('');
    }
  }, [activeTab]);

  const updateTicker = async (msg: string) => await updateDoc(doc(db, "settings", "global"), { ticker: msg });
  const updateWhatsApp = async (num: string) => await updateDoc(doc(db, "settings", "global"), { whatsapp: num });
  const updateWalletWhatsApp = async (num: string) => await updateDoc(doc(db, "settings", "global"), { walletWhatsapp: num });

  const handleAddProduct = async (newProduct: Product) => {
    const { id, ...data } = newProduct;
    await setDoc(doc(db, "products", id), data);
    setNotification('تم إضافة المنتج');
    setTimeout(() => setNotification(null), 2000);
  };

  const handleDeleteProduct = async (id: string) => {
    await deleteDoc(doc(db, "products", id));
    setNotification('تم حذف المنتج');
    setTimeout(() => setNotification(null), 2000);
  };

  const handleAddCategory = async (newCategory: Category) => {
    const { id, ...data } = newCategory;
    await setDoc(doc(db, "categories", id), data);
    setNotification('تم إضافة القسم');
    setTimeout(() => setNotification(null), 2000);
  };

  const handleDeleteCategory = async (id: string) => {
    const hasProducts = products.some(p => p.category === id);
    if (hasProducts) {
        setNotification('لا يمكن حذف قسم يحتوي على منتجات');
        setTimeout(() => setNotification(null), 3000);
        return;
    }
    await deleteDoc(doc(db, "categories", id));
    setNotification('تم حذف القسم');
    setTimeout(() => setNotification(null), 2000);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: 'pending' | 'completed' | 'rejected') => {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      setNotification(newStatus === 'completed' ? 'تم قبول الطلب' : 'تم رفض الطلب');
      setTimeout(() => setNotification(null), 2000);
  };

  const handleMarkAsRead = async (notificationId: string) => {
      if (!user) return;
      const isPrivate = privateNotifications.some(n => n.id === notificationId);
      if (isPrivate) await updateDoc(doc(db, "users", user.id, "notifications", notificationId), { read: true });
      else if (!user.readOfficial?.includes(notificationId)) {
          await updateDoc(doc(db, "users", user.id), { readOfficial: arrayUnion(notificationId) });
      }
  };

  const handleMarkAllRead = async () => {
      if (!user) return;
      const batch = writeBatch(db);
      privateNotifications.filter(n => !n.read).forEach(n => batch.update(doc(db, "users", user.id, "notifications", n.id), { read: true }));
      const unreadOfficialIds = publicNotifications.filter(n => !user.readOfficial?.includes(n.id)).map(n => n.id);
      if (unreadOfficialIds.length > 0) batch.update(doc(db, "users", user.id), { readOfficial: arrayUnion(...unreadOfficialIds) });
      await batch.commit();
  };

  const openPurchaseModal = (product: Product) => {
    if (!user) {
        setNotification("يجب تسجيل الدخول أولاً");
        setTimeout(() => setNotification(null), 2000);
        setActiveTab(Tab.PROFILE);
        return;
    }
    setSelectedProduct(product);
    setPurchaseAmount('1');
    setGameIdInput('');
    setPurchaseModalOpen(true);
  };

  const handleTrendingClick = (product: Product) => {
      const category = categories.find(c => c.id === product.category || c.dataKey === product.category);
      if (category) {
          setSelectedCategory(category);
          openPurchaseModal(product);
      }
  };

  const handleConfirmPurchase = async (isWhatsApp: boolean) => {
    if (!user || !selectedProduct) return;
    const amount = parseFloat(purchaseAmount);
    if (isNaN(amount) || amount <= 0 || !gameIdInput.trim()) {
        setNotification("يرجى التأكد من البيانات");
        setTimeout(() => setNotification(null), 2000);
        return;
    }

    if (!isWhatsApp) {
        if (user.balance < amount) {
            setNotification("رصيدك غير كافي");
            setTimeout(() => setNotification(null), 2000);
            return;
        }
        await updateDoc(doc(db, "users", user.id), { balance: user.balance - amount });
        const quantity = selectedProduct.exchangeRate ? Math.floor(amount * selectedProduct.exchangeRate) : 1;
        const newOrder: Order = { id: Date.now().toString(), userId: user.customId.toString(), userName: user.name, productName: selectedProduct.name, amountUSD: amount, quantity, gameId: gameIdInput, status: 'pending', date: new Date().toISOString() };
        await setDoc(doc(db, "orders", newOrder.id), newOrder);
        await addDoc(collection(db, "users", user.id, "notifications"), { title: "تم استلام طلبك", body: `تم استلام طلبك (${selectedProduct.name}) بنجاح.`, date: new Date().toISOString(), read: false, type: 'system' });
        setPurchaseModalOpen(false);
        setShowOrderSuccess(true);
    } else {
        if (!whatsAppNumber) return;
        const quantity = selectedProduct.exchangeRate ? Math.floor(amount * selectedProduct.exchangeRate) : 1;
        const message = `طلب جديد:%0Aالمستخدم: ${user.name}%0Aالمنتج: ${selectedProduct.name}%0Aالمبلغ: $${amount}%0Aالمعرف: ${gameIdInput}`;
        window.open(`https://wa.me/${whatsAppNumber}?text=${message}`, '_blank');
        setPurchaseModalOpen(false);
    }
  };

  const handleLogin = (userData: User) => {
    if (userData.isNewUser) {
        setSetupName(userData.name);
        setSetupPhoto(userData.photoURL || '');
        setIsProfileSetupOpen(true);
    }
  };

  const renderHome = () => (
    <>
      <div className="px-4 overflow-hidden rounded-2xl transform-gpu">
        <Banner banners={banners} />
      </div>

      <div className="px-4 mb-20">
        <Ticker message={tickerMessage} />
        <div className="flex items-center gap-2 mb-4">
          <Zap className="text-teal-500 fill-teal-500" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">{t.latest_offers}</h2>
        </div>
        <div className="space-y-4">
            {news.length > 0 ? news.map(item => (
                <div key={item.id} className="relative w-full h-40 rounded-3xl overflow-hidden group shadow-lg border border-slate-200 dark:border-slate-700/50 transform-gpu">
                    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                        <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-25deg] animate-banner-sheen" />
                    </div>
                    <img src={item.image} alt="News" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
                    <div className={`absolute inset-0 p-6 flex flex-col justify-end items-start ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                         <div className="bg-teal-500/20 backdrop-blur-md border border-teal-500/30 text-teal-300 px-3 py-1 rounded-full text-xs font-bold mb-2">New</div>
                        <h3 className="text-xl font-bold text-white leading-relaxed drop-shadow-md">{item.text}</h3>
                    </div>
                </div>
            )) : <div className="text-center py-8 text-slate-500 bg-slate-200/50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-400 dark:border-slate-700">{t.no_products}</div>}
        </div>
      </div>
    </>
  );

  const renderStore = () => {
    if (!selectedCategory) {
      const trendingProducts = products.filter(p => p.isTrending);
      const doubleTrending = [...trendingProducts, ...trendingProducts];
      const firstCategory = categories.length > 0 ? categories[0] : null;
      const otherCategories = categories.slice(1);
      
      const CategoryButton = ({ cat }: { cat: Category; key?: React.Key }) => (
          <button onClick={() => setSelectedCategory(cat)} className={`relative w-full h-32 rounded-3xl overflow-hidden group ${lang === 'ar' ? 'text-right' : 'text-left'} shadow-xl border border-slate-200 dark:border-slate-700/50 transform transition-all hover:scale-[1.01] mb-4`}>
            <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90" />
            <div className="absolute inset-0 p-6 flex items-center justify-between z-10">
                <div>
                    <h3 className="text-2xl font-bold text-white mb-1 drop-shadow-md">{cat.name}</h3>
                    <p className="text-slate-300 text-sm font-medium">{t.browse_store}</p>
                </div>
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 group-hover:bg-white group-hover:text-slate-900 transition-all">
                        <ChevronRight className={`${lang === 'ar' ? 'rotate-180' : ''}`} size={24} />
                </div>
            </div>
          </button>
      );

      return (
        <div className="px-4 pb-20">
          <div className="flex items-center gap-2 mb-6 mt-2">
             <Layers className="text-teal-500" />
             <h2 className="text-xl font-bold text-slate-800 dark:text-white">{t.browse_store}</h2>
          </div>
          <div className="flex flex-col">
             {firstCategory && <CategoryButton cat={firstCategory} />}
             {trendingProducts.length > 0 && (
                 <div className="mt-2 mb-6 overflow-hidden">
                     <div className="flex items-center gap-2 mb-4"><TrendingUp className="text-teal-400" /><h2 className="text-lg font-bold text-slate-800 dark:text-white">التطبيقات الرائجة</h2></div>
                     <div className="relative w-full overflow-hidden pb-4">
                         <div className="flex gap-2 animate-trending-marquee w-max py-2 hover:pause-marquee">
                             {doubleTrending.map((p, idx) => (
                                 <div key={`${p.id}-${idx}`} onClick={() => handleTrendingClick(p)} className="flex flex-col items-center shrink-0 w-24 cursor-pointer group">
                                     <div className="relative w-16 h-16 mb-2 rounded-full bg-[#1e293b] border border-teal-500/20 p-0.5 shadow-lg overflow-hidden group-hover:border-teal-400 group-hover:scale-110 transition-all">
                                         <div className="w-full h-full rounded-full bg-slate-800 overflow-hidden relative">
                                              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                             <div className="absolute inset-0 bg-black/10 z-10 pointer-events-none rounded-full" />
                                             <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-25deg] animate-app-sheen" />
                                         </div>
                                     </div>
                                     <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 text-center line-clamp-1 group-hover:text-teal-400 px-1">{p.name}</span>
                                 </div>
                             ))}
                         </div>
                     </div>
                 </div>
             )}
             {otherCategories.map(cat => <CategoryButton key={cat.id} cat={cat} />)}
          </div>
        </div>
      );
    }

    const filteredProducts = products
        .filter(p => p.category === selectedCategory.id || p.category === selectedCategory.dataKey)
        .filter(p => p.name.toLowerCase().includes(storeSearchQuery.toLowerCase()));

    return (
        <div className="px-4 pb-20">
            <div className="flex items-center gap-3 mb-6 mt-2">
                <button onClick={() => setSelectedCategory(null)} className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 transition-colors">
                    <ChevronRight size={24} className={lang !== 'ar' ? 'rotate-180' : ''} />
                </button>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">{selectedCategory.name}</h2>
            </div>
            <div className="relative mb-6">
                 <input type="text" placeholder={t.search_placeholder} value={storeSearchQuery} onChange={(e) => setStoreSearchQuery(e.target.value)} className="w-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl py-3 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all" />
                 <Search className={`absolute ${lang === 'ar' ? 'right-3' : 'left-3'} top-3.5 text-slate-500`} size={20} />
            </div>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4 animate-fade-in-up">
                {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} onAdd={() => openPurchaseModal(product)} />
                ))}
            </div>
             {filteredProducts.length === 0 && <div className="text-center py-10 text-slate-500 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl"><p>{t.no_products}</p></div>}
        </div>
    );
  };

  if (authLoading) return <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] flex items-center justify-center"><div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className={`min-h-screen pb-20 md:pb-0 bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 font-cairo ${lang === 'ar' ? 'rtl' : 'ltr'} transition-colors duration-300`}>
      <Header 
        onTabChange={setActiveTab} 
        user={user} 
        onOpenChat={() => setIsSupportOpen(true)} 
        lang={lang} 
        setLang={setLang} 
        unreadNotifications={user ? allNotifications.filter(n => !n.read).length : 0} 
        onLogout={logoutUser} 
        isSnowing={isSnowing}
        setIsSnowing={setIsSnowing}
      />
      <main className="max-w-7xl mx-auto pt-4 overflow-hidden">
        {activeTab === Tab.HOME && renderHome()}
        {activeTab === Tab.STORE && renderStore()}
        {activeTab === Tab.PROFILE && (user ? <Profile user={user} onLogout={logoutUser} onUpdateUser={() => {}} orders={orders} onTabChange={setActiveTab} lang={lang} walletWhatsAppNumber={walletWhatsAppNumber} /> : <Auth onLogin={handleLogin} />)}
        {activeTab === Tab.NOTIFICATIONS && user && <NotificationsPage notifications={allNotifications} onBack={() => setActiveTab(Tab.HOME)} lang={lang} onMarkAsRead={handleMarkAsRead} onMarkAllRead={handleMarkAllRead} userId={user.id} />}
        {activeTab === Tab.ORDERS && user && <OrderHistoryPage orders={orders.filter(o => o.userId === user.customId.toString())} onBack={() => setActiveTab(Tab.PROFILE)} lang={lang} />}
        {activeTab === Tab.PRIVACY && <PrivacyPage onBack={() => setActiveTab(Tab.PROFILE)} lang={lang} />}
        {activeTab === Tab.ABOUT && <AboutPage onBack={() => setActiveTab(Tab.PROFILE)} lang={lang} />}
        {activeTab === Tab.ADMIN && user?.isAdmin && <AdminDashboard currentUser={user} currentTicker={tickerMessage} onUpdateTicker={updateTicker} products={products} categories={categories} onAddProduct={handleAddProduct} onDeleteProduct={handleDeleteProduct} onAddCategory={handleAddCategory} onDeleteCategory={handleDeleteCategory} orders={orders} onUpdateOrderStatus={handleUpdateOrderStatus} whatsAppNumber={whatsAppNumber} onUpdateWhatsApp={updateWhatsApp} onRefreshData={() => {}} walletWhatsAppNumber={walletWhatsAppNumber} onUpdateWalletWhatsApp={updateWalletWhatsApp} />}
      </main>
      
      {/* عرض الثلج إذا كانت الحالة مفعلة */}
      {isSnowing && <SnowfallEffect />}

      {showOrderSuccess && <OrderSuccessModal onClose={() => setShowOrderSuccess(false)} />}
      {isProfileSetupOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md"></div>
            <div className="bg-slate-800 w-full max-w-md rounded-3xl border border-slate-700 shadow-2xl relative p-8 animate-fade-in-up z-10 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">أهلاً بك في FILEX Store! 🎉</h2>
                <p className="text-slate-400 text-sm mb-6">يرجى إكمال ملفك الشخصي للمتابعة</p>
                <div className="flex justify-center mb-6">
                     <input type="file" ref={setupFileRef} accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setSetupPhoto(reader.result as string); reader.readAsDataURL(file); } }} />
                    <div className="relative group cursor-pointer" onClick={() => setupFileRef.current?.click()}>
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-600 group-hover:border-teal-500 transition-colors shadow-lg">
                            {setupPhoto ? <img src={setupPhoto} alt="Profile" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-700 flex items-center justify-center"><Camera size={32} className="text-slate-500" /></div>}
                        </div>
                        <div className="absolute bottom-0 right-0 bg-teal-500 p-2 rounded-full border-2 border-slate-800 text-white"><Camera size={14} /></div>
                    </div>
                </div>
                <div className="space-y-4 text-right">
                    <div><label className="block text-slate-400 text-sm mb-2 font-bold">الاسم الظاهر</label><input type="text" value={setupName} onChange={(e) => setSetupName(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-teal-500 outline-none text-center font-bold" placeholder="اكتب اسمك هنا" /></div>
                    <button onClick={async () => { if (user) { await updateUserProfile(user.id, { name: setupName, photoURL: setupPhoto || undefined }); setIsProfileSetupOpen(false); } }} disabled={!setupName.trim()} className="w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 mt-4 transition-all">حفظ ومتابعة</button>
                </div>
            </div>
          </div>
      )}
      {purchaseModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setPurchaseModalOpen(false)}></div>
            <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl border border-slate-200 dark:border-teal-500/30 dark:border-slate-700 shadow-2xl relative p-6 animate-fade-in-up">
                <button onClick={() => setPurchaseModalOpen(false)} className={`absolute top-4 ${lang === 'ar' ? 'left-4' : 'right-4'} text-slate-400 hover:text-slate-600 dark:hover:text-white`}><X size={24} /></button>
                <div className="text-center mb-6"><img src={selectedProduct.image} alt={selectedProduct.name} className="w-20 h-20 rounded-2xl mx-auto mb-3 shadow-lg object-cover" /><h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedProduct.name}</h3><p className="text-sm text-slate-500 dark:text-slate-400">1$ = {selectedProduct.exchangeRate || 1} {selectedProduct.unitName}</p></div>
                <div className="space-y-4">
                    <div><label className="block text-xs text-slate-500 dark:text-slate-300 mb-1 font-bold">{t.amount_usd}</label><div className="relative"><input type="number" value={purchaseAmount} onChange={(e) => setPurchaseAmount(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl py-3 px-4 text-slate-900 dark:text-white font-bold focus:border-teal-500 outline-none" min="1" /><DollarSign className={`absolute ${lang === 'ar' ? 'left-3' : 'right-3'} top-3.5 text-slate-500`} size={18} /></div></div>
                    <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-xl border border-teal-500/20 flex justify-between items-center"><span className="text-slate-500 dark:text-slate-400 text-sm">{t.you_get}</span><div className="text-xl font-bold text-teal-600 dark:text-teal-400">{selectedProduct.exchangeRate ? Math.floor(parseFloat(purchaseAmount || '0') * selectedProduct.exchangeRate) : 1} {selectedProduct.unitName}</div></div>
                    <div><label className="block text-xs text-slate-500 dark:text-slate-300 mb-1 font-bold">{t.player_id}</label><input type="text" value={gameIdInput} onChange={(e) => setGameIdInput(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:border-teal-500 outline-none font-mono text-center" placeholder="ID" /></div>
                    <div className="grid grid-cols-2 gap-3 pt-4"><button onClick={() => handleConfirmPurchase(true)} className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"><Send size={18} className={lang === 'ar' ? 'rotate-180' : ''} /> {t.whatsapp_order}</button><button onClick={() => handleConfirmPurchase(false)} className="bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">{t.buy_now}</button></div>
                </div>
            </div>
        </div>
      )}
      {notification && <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-teal-500 text-white px-6 py-2 rounded-full shadow-lg z-[100] animate-fade-in-down whitespace-nowrap">{notification}</div>}
      {activeTab !== Tab.ADMIN && <BottomNav activeTab={activeTab} onTabChange={setActiveTab} lang={lang} />}
      <CustomerSupport isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} user={user} />
      <style>{`
          @keyframes banner-sheen { 0% { left: -100%; } 30% { left: 120%; } 100% { left: 120%; } }
          .animate-banner-sheen { animation: banner-sheen 3s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
          .animate-app-sheen { animation: banner-sheen 2s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
          @keyframes trending-marquee { 0% { transform: translateX(0); } 100% { transform: translateX(${lang === 'ar' ? '50%' : '-50%'}); } }
          .animate-trending-marquee { animation: trending-marquee 25s linear infinite; }
          .hover\\:pause-marquee:hover { animation-play-state: paused; }
          @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
          .transform-gpu { transform: translate3d(0,0,0); backface-visibility: hidden; }
      `}</style>
    </div>
  );
}

export default App;
