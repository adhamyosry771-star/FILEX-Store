
import React, { useState, useEffect } from 'react';
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
import { Product, Tab, User, Category, Order, BannerData, NewsItem, Language, Notification } from './types';
import { subscribeToAuthChanges, logoutUser } from './auth';
import { Layers, ChevronRight, Zap, X, DollarSign, Send } from 'lucide-react';
import { db } from './firebase';
import { collection, onSnapshot, doc, updateDoc, query, orderBy, setDoc, deleteDoc, addDoc, writeBatch } from 'firebase/firestore';
import { TRANSLATIONS } from './constants';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.HOME);
  const [notification, setNotification] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [lang, setLang] = useState<Language>('ar');
  
  const t = TRANSLATIONS[lang];

  // --- Persistent Data State (Synced with Firestore) ---
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [userNotifications, setUserNotifications] = useState<Notification[]>([]);
  const [tickerMessage, setTickerMessage] = useState('');
  const [whatsAppNumber, setWhatsAppNumber] = useState('');
  const [walletWhatsAppNumber, setWalletWhatsAppNumber] = useState(''); 

  // --- Purchase Modal State ---
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false); // New state for success modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [purchaseAmount, setPurchaseAmount] = useState<string>('1');
  const [gameIdInput, setGameIdInput] = useState('');

  // Store State
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // --- Localization Effect ---
  useEffect(() => {
    document.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // --- Real-time Data Listeners ---
  useEffect(() => {
    // 1. Products
    const unsubProducts = onSnapshot(collection(db, "products"), (snapshot) => {
        const loadedProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(loadedProducts);
    });

    // 2. Categories
    const unsubCategories = onSnapshot(collection(db, "categories"), (snapshot) => {
        const loadedCategories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
        setCategories(loadedCategories);
    });

    // 3. Orders (Sorted by date)
    const ordersQuery = query(collection(db, "orders"), orderBy("date", "desc"));
    const unsubOrders = onSnapshot(ordersQuery, (snapshot) => {
        const loadedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        setOrders(loadedOrders);
    });

    // 4. Banners
    const unsubBanners = onSnapshot(collection(db, "banners"), (snapshot) => {
        const loadedBanners = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BannerData));
        setBanners(loadedBanners);
    });

    // 5. News
    const unsubNews = onSnapshot(collection(db, "news"), (snapshot) => {
        const loadedNews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsItem));
        setNews(loadedNews);
    });

    // 6. Global Settings (Ticker & WhatsApp)
    const unsubSettings = onSnapshot(doc(db, "settings", "global"), (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            setTickerMessage(data.ticker || 'مرحباً بكم في FILEX Store');
            setWhatsAppNumber(data.whatsapp || '');
            setWalletWhatsAppNumber(data.walletWhatsapp || '01027833873'); 
        } else {
             // Create default if not exists
             setDoc(doc(db, "settings", "global"), {
                 ticker: 'مرحباً بكم في FILEX Store - الوجهة الأولى لشحن الألعاب',
                 whatsapp: '',
                 walletWhatsapp: '01027833873'
             });
             setWalletWhatsAppNumber('01027833873');
        }
    });

    return () => {
        unsubProducts();
        unsubCategories();
        unsubOrders();
        unsubSettings();
        unsubBanners();
        unsubNews();
    };
  }, []);

  // --- Auth & User Data Listener ---
  useEffect(() => {
    let unsubUserDoc: (() => void) | null = null;
    let unsubUserNotifs: (() => void) | null = null;

    const unsubscribeAuth = subscribeToAuthChanges((authUser) => {
      if (authUser) {
          // Listen to the specific user document for balance/status changes in real-time
          unsubUserDoc = onSnapshot(doc(db, "users", authUser.id), (docSnap) => {
              if (docSnap.exists()) {
                  // Merge auth info with Firestore info
                  setUser({ ...authUser, ...docSnap.data() } as User);
              } else {
                  setUser(authUser);
              }
          });

          // Listen to Notifications
          const notifQuery = query(collection(db, "users", authUser.id, "notifications"), orderBy("date", "desc"));
          unsubUserNotifs = onSnapshot(notifQuery, (snapshot) => {
              const loadedNotifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
              setUserNotifications(loadedNotifs);
          });

      } else {
          if (unsubUserDoc) unsubUserDoc();
          if (unsubUserNotifs) unsubUserNotifs();
          setUser(null);
          setUserNotifications([]);
          if (activeTab === Tab.ADMIN || activeTab === Tab.NOTIFICATIONS) setActiveTab(Tab.HOME);
      }
      setAuthLoading(false);
    });

    return () => {
        unsubscribeAuth();
        if (unsubUserDoc) unsubUserDoc();
        if (unsubUserNotifs) unsubUserNotifs();
    };
  }, [activeTab]);

  // Reset category selection when switching tabs
  useEffect(() => {
    if (activeTab !== Tab.STORE) {
      setSelectedCategory(null);
    }
  }, [activeTab]);

  // --- Handlers (Firestore Actions) ---

  const updateTicker = async (msg: string) => {
    await updateDoc(doc(db, "settings", "global"), { ticker: msg });
  };
  
  const updateWhatsApp = async (num: string) => {
    await updateDoc(doc(db, "settings", "global"), { whatsapp: num });
  };

  const updateWalletWhatsApp = async (num: string) => {
    await updateDoc(doc(db, "settings", "global"), { walletWhatsapp: num });
  };

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
    const categoryKey = categories.find(c => c.id === id)?.dataKey;
    const hasProducts = products.some(p => p.category === categoryKey);
    
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
      await updateDoc(doc(db, "users", user.id, "notifications", notificationId), { read: true });
  };

  const handleMarkAllRead = async () => {
      if (!user) return;
      const batch = writeBatch(db);
      userNotifications.filter(n => !n.read).forEach(n => {
          const docRef = doc(db, "users", user.id, "notifications", n.id);
          batch.update(docRef, { read: true });
      });
      await batch.commit();
  };

  // --- Purchase Logic ---
  const openPurchaseModal = (product: Product) => {
    if (!user) {
        setNotification("يجب تسجيل الدخول أولاً");
        setTimeout(() => setNotification(null), 2000);
        setActiveTab(Tab.PROFILE); // Redirect to login
        return;
    }
    setSelectedProduct(product);
    setPurchaseAmount('1');
    setGameIdInput('');
    setPurchaseModalOpen(true);
  };

  const handleConfirmPurchase = async (isWhatsApp: boolean) => {
    if (!user || !selectedProduct) return;
    
    const amount = parseFloat(purchaseAmount);
    if (isNaN(amount) || amount <= 0) {
        setNotification("يرجى إدخال مبلغ صحيح");
        setTimeout(() => setNotification(null), 2000);
        return;
    }

    if (!gameIdInput.trim()) {
        setNotification("يرجى إدخال معرف اللاعب (Game ID)");
        setTimeout(() => setNotification(null), 2000);
        return;
    }

    // Direct Purchase (Internal)
    if (!isWhatsApp) {
        if (user.balance < amount) {
            setNotification("رصيدك غير كافي لإتمام العملية");
            setTimeout(() => setNotification(null), 2000);
            return;
        }

        // 1. Deduct Balance
        const newBalance = user.balance - amount;
        await updateDoc(doc(db, "users", user.id), { balance: newBalance });

        // 2. Create Order
        const quantity = selectedProduct.exchangeRate ? Math.floor(amount * selectedProduct.exchangeRate) : 1;
        const newOrder: Order = {
            id: Date.now().toString(),
            userId: user.customId.toString(),
            userName: user.name,
            productName: selectedProduct.name,
            amountUSD: amount,
            quantity: quantity,
            gameId: gameIdInput,
            status: 'pending',
            date: new Date().toISOString()
        };
        await setDoc(doc(db, "orders", newOrder.id), newOrder);

        // 3. Send System Notification (Auto)
        await addDoc(collection(db, "users", user.id, "notifications"), {
            title: "تم استلام طلبك",
            body: `شكراً لك على تعاملك معنا. تم استلام طلبك (${selectedProduct.name}) بنجاح، برجاء الانتظار حتى مراجعة الطلب.`,
            date: new Date().toISOString(),
            read: false,
            type: 'system'
        });

        // Close modal and show success popup
        setPurchaseModalOpen(false);
        setShowOrderSuccess(true);
    } 
    // WhatsApp Order
    else {
        if (!whatsAppNumber) {
            setNotification("لم يتم تعيين رقم الوكيل، يرجى التواصل مع الإدارة");
            setTimeout(() => setNotification(null), 3000);
            return;
        }
        
        const quantity = selectedProduct.exchangeRate ? Math.floor(amount * selectedProduct.exchangeRate) : 1;
        const message = `طلب جديد:%0Aالمستخدم: ${user.name} (ID: ${user.customId})%0Aالمنتج: ${selectedProduct.name}%0Aالمبلغ: $${amount}%0Aالكمية: ${quantity} ${selectedProduct.unitName || ''}%0Aمعرف اللعبة: ${gameIdInput}`;
        
        window.open(`https://wa.me/${whatsAppNumber}?text=${message}`, '_blank');
        setPurchaseModalOpen(false);
    }
  };

  const handleLogin = (userData: User) => {
    setNotification(`${t.welcome} ${userData.name}`);
    setTimeout(() => setNotification(null), 2000);
  };

  const handleLogout = async () => {
    await logoutUser();
    setActiveTab(Tab.HOME);
    setNotification('تم تسجيل الخروج بنجاح');
    setTimeout(() => setNotification(null), 2000);
  };

  // --- Home Tab ---
  const renderHome = () => (
    <>
      <div className="px-4">
        <Banner banners={banners} />
      </div>

      <div className="px-4 mb-20">
        <Ticker message={tickerMessage} />

        <div className="flex items-center gap-2 mb-4">
          <Zap className="text-teal-500 fill-teal-500" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">{t.latest_offers}</h2>
        </div>

        <div className="space-y-4">
            {news.length > 0 ? (
                news.map(item => (
                    <div key={item.id} className="relative w-full h-40 rounded-3xl overflow-hidden group shadow-lg border border-slate-200 dark:border-slate-700/50">
                        {/* Image */}
                        <img src={item.image} alt="News" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
                        
                        {/* Content */}
                        <div className={`absolute inset-0 p-6 flex flex-col justify-end items-start ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                             <div className="bg-teal-500/20 backdrop-blur-md border border-teal-500/30 text-teal-300 px-3 py-1 rounded-full text-xs font-bold mb-2">
                                New
                            </div>
                            <h3 className="text-xl font-bold text-white leading-relaxed drop-shadow-md">
                                {item.text}
                            </h3>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-8 text-slate-500 bg-slate-200/50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-400 dark:border-slate-700">
                    {t.no_products}
                </div>
            )}
        </div>
      </div>
    </>
  );

  // --- Store Tab ---
  const renderStore = () => {
    if (!selectedCategory) {
      return (
        <div className="px-4 pb-20">
          <div className="flex items-center gap-2 mb-6 mt-2">
             <Layers className="text-teal-500" />
             <h2 className="text-xl font-bold text-slate-800 dark:text-white">{t.browse_store}</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
             {categories.map(cat => (
                 <button 
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat)}
                    className={`relative w-full h-32 rounded-3xl overflow-hidden group ${lang === 'ar' ? 'text-right' : 'text-left'} shadow-xl border border-slate-200 dark:border-slate-700/50 transform transition-all hover:scale-[1.02]`}
                 >
                    <img 
                        src={cat.image} 
                        alt={cat.name} 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    {/* Luxury Dark Overlay */}
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
             ))}
             {categories.length === 0 && (
                 <div className="text-center py-10 text-slate-500">
                     {t.no_products}
                 </div>
             )}
          </div>
        </div>
      );
    }

    return (
        <div className="px-4 pb-20">
            <div className="flex items-center gap-3 mb-6 mt-2">
                <button 
                    onClick={() => setSelectedCategory(null)}
                    className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                >
                    <ChevronRight size={24} className={lang !== 'ar' ? 'rotate-180' : ''} />
                </button>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">{selectedCategory.name}</h2>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 animate-fade-in-up">
                {products
                    .filter(p => p.category === selectedCategory.dataKey)
                    .map((product) => (
                        <ProductCard key={product.id} product={product} onAdd={() => openPurchaseModal(product)} />
                    ))
                }
            </div>
             
             {products.filter(p => p.category === selectedCategory.dataKey).length === 0 && (
                 <div className="text-center py-10 text-slate-500 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl">
                     <p>{t.no_products}</p>
                 </div>
             )}
        </div>
    );
  };

  if (authLoading) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    )
  }

  return (
    <div className={`min-h-screen pb-20 md:pb-0 bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 font-cairo ${lang === 'ar' ? 'rtl' : 'ltr'} transition-colors duration-300`}>
      <Header 
        onTabChange={setActiveTab}
        user={user}
        onOpenChat={() => setIsSupportOpen(true)}
        lang={lang}
        setLang={setLang}
        unreadNotifications={userNotifications.filter(n => !n.read).length}
        onLogout={handleLogout}
      />
      
      <main className="max-w-7xl mx-auto pt-4">
        {activeTab === Tab.HOME && renderHome()}
        {activeTab === Tab.STORE && renderStore()}
        
        {activeTab === Tab.PROFILE && (
            user ? (
                <Profile 
                    user={user} 
                    onLogout={handleLogout} 
                    onUpdateUser={() => {/* No op */}} 
                    orders={orders} 
                    onTabChange={setActiveTab}
                    lang={lang}
                    walletWhatsAppNumber={walletWhatsAppNumber}
                />
            ) : (
                <Auth onLogin={handleLogin} />
            )
        )}

        {/* Notifications Page */}
        {activeTab === Tab.NOTIFICATIONS && user && (
            <NotificationsPage 
                notifications={userNotifications}
                onBack={() => setActiveTab(Tab.HOME)}
                lang={lang}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllRead={handleMarkAllRead}
            />
        )}

        {/* Full Page Order History */}
        {activeTab === Tab.ORDERS && user && (
            <OrderHistoryPage 
                orders={orders.filter(o => o.userId === user.customId.toString())} 
                onBack={() => setActiveTab(Tab.PROFILE)}
                lang={lang}
            />
        )}

        {/* Redirect to login if accessing protected tabs without user */}
        {(activeTab === Tab.ORDERS || activeTab === Tab.PROFILE || activeTab === Tab.NOTIFICATIONS) && !user && activeTab !== Tab.PROFILE && (
            <Auth onLogin={handleLogin} />
        )}

        {/* Admin Dashboard */}
        {activeTab === Tab.ADMIN && user?.isAdmin && (
            <AdminDashboard 
                currentUser={user} 
                currentTicker={tickerMessage}
                onUpdateTicker={updateTicker}
                products={products}
                categories={categories}
                onAddProduct={handleAddProduct}
                onDeleteProduct={handleDeleteProduct}
                onAddCategory={handleAddCategory}
                onDeleteCategory={handleDeleteCategory}
                orders={orders}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                whatsAppNumber={whatsAppNumber}
                onUpdateWhatsApp={updateWhatsApp}
                onRefreshData={() => {/* No op, realtime */}}
                walletWhatsAppNumber={walletWhatsAppNumber}
                onUpdateWalletWhatsApp={updateWalletWhatsApp}
            />
        )}
      </main>

      {/* Success Modal */}
      {showOrderSuccess && (
          <OrderSuccessModal onClose={() => setShowOrderSuccess(false)} />
      )}

      {/* Purchase Modal */}
      {purchaseModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setPurchaseModalOpen(false)}></div>
            <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl relative p-6 animate-fade-in-up">
                <button onClick={() => setPurchaseModalOpen(false)} className={`absolute top-4 ${lang === 'ar' ? 'left-4' : 'right-4'} text-slate-400 hover:text-slate-600 dark:hover:text-white`}>
                    <X size={24} />
                </button>
                
                <div className="text-center mb-6">
                    <img src={selectedProduct.image} alt={selectedProduct.name} className="w-20 h-20 rounded-2xl mx-auto mb-3 shadow-lg object-cover bg-slate-100 dark:bg-slate-900" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedProduct.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">1$ = {selectedProduct.exchangeRate || 1} {selectedProduct.unitName}</p>
                </div>

                <div className="space-y-4">
                    {/* Amount Input */}
                    <div>
                        <label className="block text-xs text-slate-500 dark:text-slate-300 mb-1 font-bold">{t.amount_usd}</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                value={purchaseAmount}
                                onChange={(e) => setPurchaseAmount(e.target.value)}
                                className={`w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl py-3 px-4 ${lang === 'ar' ? 'pl-10' : 'pr-10'} text-slate-900 dark:text-white font-bold focus:border-teal-500 focus:outline-none`}
                                placeholder="1"
                                min="1"
                            />
                            <DollarSign className={`absolute ${lang === 'ar' ? 'left-3' : 'right-3'} top-3.5 text-slate-500`} size={18} />
                        </div>
                    </div>

                    {/* Calculated Quantity Display */}
                    <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-xl border border-teal-500/20 flex justify-between items-center">
                        <span className="text-slate-500 dark:text-slate-400 text-sm">{t.you_get}</span>
                        <div className="text-xl font-bold text-teal-600 dark:text-teal-400">
                            {selectedProduct.exchangeRate 
                                ? Math.floor(parseFloat(purchaseAmount || '0') * selectedProduct.exchangeRate) 
                                : 1} {selectedProduct.unitName}
                        </div>
                    </div>

                    {/* Game ID Input */}
                    <div>
                        <label className="block text-xs text-slate-500 dark:text-slate-300 mb-1 font-bold">{t.player_id}</label>
                        <input 
                            type="text" 
                            value={gameIdInput}
                            onChange={(e) => setGameIdInput(e.target.value)}
                            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:border-teal-500 focus:outline-none"
                            placeholder="ID..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-4">
                        <button 
                            onClick={() => handleConfirmPurchase(true)}
                            className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                        >
                            <Send size={18} className={lang === 'ar' ? 'rotate-180' : ''} /> {t.whatsapp_order}
                        </button>
                        <button 
                            onClick={() => handleConfirmPurchase(false)}
                            className="bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                        >
                             {t.buy_now}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {notification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-teal-500 text-white px-6 py-2 rounded-full shadow-lg z-[100] animate-fade-in-down whitespace-nowrap">
          {notification}
        </div>
      )}

      {activeTab !== Tab.ADMIN && (
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} lang={lang} />
      )}
      
      <CustomerSupport isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} user={user} />
    </div>
  );
}

export default App;
