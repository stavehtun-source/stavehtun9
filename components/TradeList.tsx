
import React, { useState } from 'react';
import { Trade, TradeStatus, TradeType, Language } from '../types';
import { getTranslation } from '../translations';
import { Trash2, ArrowUpRight, ArrowDownRight, Calendar, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';

interface TradeListProps {
  trades: Trade[];
  onDelete: (id: string) => void;
  lang: Language;
}

const TradeCard = ({ trade, onDelete, getStatusBadge, t }: { trade: Trade, onDelete: (id: string) => void, getStatusBadge: (status: TradeStatus) => React.ReactNode, t: (key: string) => string }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
        className={`glass-card rounded-2xl transition-all duration-300 overflow-hidden ${isExpanded ? 'bg-midnight-800 ring-1 ring-emerald-500/30' : 'active:scale-[0.98]'}`}
        onClick={() => setIsExpanded(!isExpanded)}
    >
        <div className="p-5">
            {/* Main Header Row */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                     <div className={`p-2 rounded-lg ${trade.type === TradeType.BUY ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                         {trade.type === TradeType.BUY ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg leading-none">{trade.pair}</h3>
                        <p className="text-xs text-slate-400 mt-1">
                           {new Date(trade.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} • {trade.lotSize} Lot
                        </p>
                    </div>
                </div>
                
                <div className="flex flex-col items-end gap-1">
                     <span className={`font-mono font-bold text-lg ${trade.pnl > 0 ? 'text-emerald-400' : trade.pnl < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                        {trade.pnl > 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                    </span>
                    {getStatusBadge(trade.status)}
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-white/5 animate-fade-in space-y-4" onClick={(e) => e.stopPropagation()}>
                    {/* Prices Grid */}
                    <div className="grid grid-cols-2 gap-3">
                         <div className="bg-white/5 rounded-lg p-2.5 border border-white/5">
                            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">{t('entryPrice')}</span>
                            <span className="text-slate-200 font-mono text-sm">{trade.entryPrice}</span>
                        </div>
                         <div className="bg-white/5 rounded-lg p-2.5 border border-white/5">
                            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">{t('exitPrice')}</span>
                            <span className="text-slate-200 font-mono text-sm">{trade.exitPrice}</span>
                        </div>
                    </div>
                    
                    {/* Details */}
                    <div className="space-y-3">
                        {trade.setup && (
                             <div>
                                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">{t('strategy')}</span>
                                <p className="text-sm text-slate-300">{trade.setup}</p>
                             </div>
                        )}
                        {trade.notes && (
                             <div>
                                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">{t('notes')}</span>
                                <p className="text-sm text-slate-400 italic bg-black/20 p-2 rounded border border-white/5 leading-relaxed">{trade.notes}</p>
                             </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end pt-2">
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(trade.id);
                            }}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 text-xs font-bold transition-colors border border-red-500/10"
                        >
                            <Trash2 size={14} />
                            DELETE
                        </button>
                    </div>
                </div>
            )}
            
            {/* Expand Hint */}
            {!isExpanded && (
                <div className="flex justify-center mt-3 opacity-30">
                     <ChevronDown size={16} />
                </div>
            )}
            {isExpanded && (
                <div className="flex justify-center mt-3 opacity-30" onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}>
                     <ChevronUp size={16} />
                </div>
            )}
        </div>
    </div>
  );
};

const TradeList: React.FC<TradeListProps> = ({ trades, onDelete, lang }) => {
  const t = (key: any) => getTranslation(lang, key);

  // Sort trades by date descending
  const sortedTrades = [...trades].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getStatusBadge = (status: TradeStatus) => {
    const styles = {
      [TradeStatus.WIN]: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 ring-emerald-500/20',
      [TradeStatus.LOSS]: 'bg-red-500/10 text-red-400 border-red-500/20 ring-red-500/20',
      [TradeStatus.BE]: 'bg-amber-500/10 text-amber-400 border-amber-500/20 ring-amber-500/20',
      [TradeStatus.OPEN]: 'bg-blue-500/10 text-blue-400 border-blue-500/20 ring-blue-500/20',
    };

    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ring-1 ${styles[status]} inline-flex items-center gap-1 uppercase tracking-wider`}>
        <span className={`w-1.5 h-1.5 rounded-full ${status === TradeStatus.WIN ? 'bg-emerald-400' : status === TradeStatus.LOSS ? 'bg-red-400' : 'bg-amber-400'}`}></span>
        {status}
      </span>
    );
  };

  if (sortedTrades.length === 0) {
    return (
        <div className="glass-card rounded-2xl p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                <span className="text-2xl opacity-20">📝</span>
            </div>
            <p className="text-sm font-medium">{t('noTrades')}</p>
        </div>
    );
  }

  return (
    <>
    {/* Desktop View (Table) */}
    <div className="hidden md:block glass-card rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-400">
          <thead className="bg-white/5 text-slate-200 uppercase font-bold text-[11px] tracking-wider">
            <tr>
              <th className="px-6 py-5 font-bold text-slate-400">{t('date')}</th>
              <th className="px-6 py-5 font-bold text-slate-400">{t('pair')}</th>
              <th className="px-6 py-5 font-bold text-slate-400">{t('type')}</th>
              <th className="px-6 py-5 font-bold text-slate-400">{t('strategy')}</th>
              <th className="px-6 py-5 font-bold text-slate-400">{t('lot')}</th>
              <th className="px-6 py-5 font-bold text-slate-400">{t('pnl')}</th>
              <th className="px-6 py-5 font-bold text-slate-400">{t('status')}</th>
              <th className="px-6 py-5 text-right font-bold text-slate-400">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
              {sortedTrades.map((trade) => (
                <tr key={trade.id} className="group hover:bg-white/[0.02] transition-colors duration-200">
                  <td className="px-6 py-5 whitespace-nowrap font-medium text-slate-300">
                    {new Date(trade.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                  </td>
                  <td className="px-6 py-5">
                    <span className="font-bold text-white bg-white/5 px-2 py-1 rounded text-xs tracking-wide border border-white/5">
                        {trade.pair}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className={`flex items-center gap-1 font-bold text-xs ${trade.type === TradeType.BUY ? 'text-emerald-400' : 'text-red-400'}`}>
                      {trade.type === TradeType.BUY ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {trade.type}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-slate-400 text-xs">
                    {trade.setup || '-'}
                  </td>
                  <td className="px-6 py-5 text-slate-300 font-mono text-xs">
                    {trade.lotSize.toFixed(2)}
                  </td>
                  <td className={`px-6 py-5 font-mono font-bold text-sm ${trade.pnl > 0 ? 'text-emerald-400' : trade.pnl < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                    {trade.pnl > 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                  </td>
                  <td className="px-6 py-5">
                    {getStatusBadge(trade.status)}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button 
                      onClick={() => onDelete(trade.id)}
                      className="text-slate-600 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Delete Trade"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* Mobile View (Cards) - Better for Android users */}
    <div className="md:hidden space-y-4 pb-20">
        {sortedTrades.map((trade) => (
            <TradeCard 
                key={trade.id} 
                trade={trade} 
                onDelete={onDelete} 
                getStatusBadge={getStatusBadge}
                t={t}
            />
        ))}
    </div>
    </>
  );
};

export default TradeList;
