
import React from 'react';
import { Order, Language } from '../types';
import { Clock, Activity, ArrowLeft, ArrowRight } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { Tab } from '../types';

interface OrderHistoryPageProps {
  orders: Order[];
  onBack: () => void;
  lang: Language;
}

const OrderHistoryPage: React.FC<OrderHistoryPageProps> = ({ orders, onBack, lang }) => {
  const t = TRANSLATIONS[lang];
  const sortedOrders = [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="px-4 pb-20 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 py-6">
        <button 
          onClick={onBack}
          className="bg-slate-800 p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
        >
          {lang === 'ar' ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
        </button>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Clock className="text-teal-500" /> {t.orders}
        </h2>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {sortedOrders.length > 0 ? (
            sortedOrders.map(order => (
                <div key={order.id} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 hover:border-teal-500/20 transition-all shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <div className="font-bold text-lg text-white mb-1">{order.productName}</div>
                            <div className="text-xs text-slate-400 font-mono bg-slate-900/50 px-2 py-0.5 rounded inline-block">
                                ID: {order.id.slice(-8)}
                            </div>
                        </div>
                        <div className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                            order.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                            order.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                            'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                        }`}>
                            {order.status === 'completed' ? t.order_status_completed : 
                             order.status === 'rejected' ? t.order_status_rejected : t.order_status_pending}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm bg-slate-900/30 p-3 rounded-xl border border-slate-800">
                        <div>
                            <span className="text-slate-500 text-xs block mb-0.5">{t.quantity}</span>
                            <span className="text-slate-200 font-bold">{order.quantity}</span>
                        </div>
                        <div>
                            <span className="text-slate-500 text-xs block mb-0.5">{t.price}</span>
                            <span className="text-green-400 font-bold">${order.amountUSD}</span>
                        </div>
                        <div className="col-span-2">
                            <span className="text-slate-500 text-xs block mb-0.5">{t.player_id}</span>
                            <span className="text-slate-200 font-mono select-all bg-slate-800 px-2 py-0.5 rounded text-xs">{order.gameId}</span>
                        </div>
                    </div>
                    
                    <div className="mt-3 text-[10px] text-slate-500 text-right">
                        {new Date(order.date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { 
                            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                        })}
                    </div>
                </div>
            ))
        ) : (
            <div className="flex flex-col items-center justify-center text-slate-500 py-20 opacity-50">
                <Activity size={64} className="mb-4" strokeWidth={1} />
                <p className="text-lg font-medium">{t.no_orders}</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
