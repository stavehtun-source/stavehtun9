
import React, { useState, useEffect } from 'react';
import { Trade, TradeStatus, TradeType, Language } from '../types';
import { getTranslation } from '../translations';
import { Save, X, Calendar, Hash, DollarSign, TrendingUp, FileText, Tag, Cloud } from 'lucide-react';

interface TradeFormProps {
  onSave: (trade: Trade) => void;
  onCancel: () => void;
  lang: Language;
}

const COMMON_PAIRS = [
    'EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'USDCAD', 'AUDUSD', 
    'NZDUSD', 'USDCHF', 'GBPJPY', 'EURJPY', 'BTCUSD', 'ETHUSD'
];

const TradeForm: React.FC<TradeFormProps> = ({ onSave, onCancel, lang }) => {
  const t = (key: any) => getTranslation(lang, key);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<Trade>>({
    date: new Date().toISOString().split('T')[0],
    pair: 'EURUSD',
    type: TradeType.BUY,
    lotSize: 0.01,
    entryPrice: 0,
    exitPrice: 0,
    pnl: 0,
    status: TradeStatus.OPEN,
    setup: '',
    notes: '',
    tags: []
  });

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('protrade_draft_entry');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setFormData(parsed);
        const now = new Date();
        setLastSaved(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } catch (e) {
        console.error("Failed to restore draft", e);
      }
    }
  }, []);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      localStorage.setItem('protrade_draft_entry', JSON.stringify(formData));
      const now = new Date();
      setLastSaved(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 30000);

    return () => clearInterval(timer);
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      // Handle number fields
      if (['entryPrice', 'exitPrice', 'lotSize', 'pnl'].includes(name)) {
        return { ...prev, [name]: parseFloat(value) || 0 };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTrade: Trade = {
      id: crypto.randomUUID(),
      date: formData.date!,
      pair: formData.pair!.toUpperCase(),
      type: formData.type as TradeType,
      entryPrice: formData.entryPrice!,
      exitPrice: formData.exitPrice!,
      lotSize: formData.lotSize!,
      pnl: formData.pnl!,
      status: formData.status as TradeStatus,
      setup: formData.setup || '',
      notes: formData.notes || '',
      tags: []
    };

    // Clear draft upon successful save
    localStorage.removeItem('protrade_draft_entry');
    
    onSave(newTrade);
  };

  const InputGroup = ({ label, icon: Icon, children }: any) => (
     <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Icon size={12} /> {label}
        </label>
        {children}
     </div>
  );

  const inputClasses = "w-full bg-midnight-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all placeholder-slate-600 font-medium";

  return (
    <div className="max-w-3xl mx-auto glass-card p-8 rounded-2xl animate-fade-in relative overflow-hidden">
       {/* Decorative glowing bar at top */}
       <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500"></div>

      <div className="flex justify-between items-center mb-8">
        <div>
            <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-white">{t('logTrade')}</h2>
                {lastSaved && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <Cloud size={12} className="text-emerald-400" />
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">Auto-saved {lastSaved}</span>
                    </div>
                )}
            </div>
            <p className="text-slate-400 text-sm mt-1">{t('executionDetails')}</p>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date & Pair */}
          <InputGroup label={t('date')} icon={Calendar}>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={inputClasses}
              required
            />
          </InputGroup>
          <InputGroup label={t('pair')} icon={Hash}>
            <input
              type="text"
              name="pair"
              value={formData.pair}
              onChange={handleChange}
              placeholder="e.g. GBPJPY"
              list="common-pairs"
              className={`${inputClasses} uppercase tracking-widest`}
              required
            />
            <datalist id="common-pairs">
                {COMMON_PAIRS.map(pair => <option key={pair} value={pair} />)}
            </datalist>
          </InputGroup>

          {/* Type & Status */}
          <InputGroup label={t('direction')} icon={TrendingUp}>
            <div className="grid grid-cols-2 gap-2">
                <button
                    type="button"
                    onClick={() => setFormData({...formData, type: TradeType.BUY})}
                    className={`py-3 rounded-xl font-bold text-sm transition-all border ${formData.type === TradeType.BUY ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-900/20' : 'bg-midnight-950 text-slate-400 border-white/10 hover:bg-white/5'}`}
                >
                    BUY
                </button>
                <button
                    type="button"
                    onClick={() => setFormData({...formData, type: TradeType.SELL})}
                    className={`py-3 rounded-xl font-bold text-sm transition-all border ${formData.type === TradeType.SELL ? 'bg-red-500 text-white border-red-400 shadow-lg shadow-red-900/20' : 'bg-midnight-950 text-slate-400 border-white/10 hover:bg-white/5'}`}
                >
                    SELL
                </button>
            </div>
          </InputGroup>

          <InputGroup label={t('outcome')} icon={Tag}>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={inputClasses}
            >
              <option value={TradeStatus.OPEN}>OPEN</option>
              <option value={TradeStatus.WIN}>WIN</option>
              <option value={TradeStatus.LOSS}>LOSS</option>
              <option value={TradeStatus.BE}>BREAK EVEN</option>
            </select>
          </InputGroup>

          {/* Entry & Exit */}
          <InputGroup label={t('entryPrice')} icon={DollarSign}>
            <input
              type="number"
              step="any"
              name="entryPrice"
              value={formData.entryPrice}
              onChange={handleChange}
              className={inputClasses}
            />
          </InputGroup>
          <InputGroup label={t('exitPrice')} icon={DollarSign}>
            <input
              type="number"
              step="any"
              name="exitPrice"
              value={formData.exitPrice}
              onChange={handleChange}
              className={inputClasses}
            />
          </InputGroup>

          {/* Lot & PnL */}
          <InputGroup label={t('lotSize')} icon={Hash}>
            <input
              type="number"
              step="0.01"
              name="lotSize"
              value={formData.lotSize}
              onChange={handleChange}
              className={inputClasses}
            />
          </InputGroup>
          <InputGroup label={t('profitLoss')} icon={DollarSign}>
            <input
              type="number"
              step="any"
              name="pnl"
              value={formData.pnl}
              onChange={handleChange}
              className={`${inputClasses} ${
                (formData.pnl || 0) > 0 ? 'text-emerald-400 border-emerald-500/30' : (formData.pnl || 0) < 0 ? 'text-red-400 border-red-500/30' : ''
              }`}
            />
          </InputGroup>
        </div>

        {/* Setup & Notes */}
        <div className="space-y-6">
            <InputGroup label={t('setup')} icon={Tag}>
                <input
                type="text"
                name="setup"
                value={formData.setup}
                onChange={handleChange}
                placeholder="e.g. 4H Break & Retest"
                className={inputClasses}
                />
            </InputGroup>
            <InputGroup label={t('notes')} icon={FileText}>
                <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                placeholder={t('describeNotes')}
                className={`${inputClasses} resize-none focus:bg-midnight-900`}
                />
            </InputGroup>
        </div>

        <div className="flex justify-end pt-6 border-t border-white/10">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 rounded-xl text-slate-400 hover:bg-white/5 transition-colors mr-4 font-semibold"
          >
            {t('discard')}
          </button>
          <button
            type="submit"
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-bold shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-[1.02] flex items-center gap-2"
          >
            <Save size={18} />
            {t('saveEntry')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TradeForm;
