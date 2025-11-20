
import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import TradeList from './components/TradeList';
import TradeForm from './components/TradeForm';
import AIAnalysis from './components/AIAnalysis';
import LiveChat from './components/LiveChat';
import Auth from './components/Auth';
import UserProfile from './components/UserProfile';
import { Trade, TradeStatus, TradeType, View, User, Language } from './types';
import { translations, getTranslation, TranslationKey } from './translations';
import { LayoutDashboard, BookOpen, PlusCircle, BrainCircuit, LogOut, User as UserIcon, Settings, ChevronRight, Globe, Mic } from 'lucide-react';

// Initial mock data
const MOCK_TRADES: Trade[] = [
  {
    id: '1',
    date: '2023-10-01',
    pair: 'EURUSD',
    type: TradeType.BUY,
    entryPrice: 1.0500,
    exitPrice: 1.0550,
    lotSize: 1.0,
    pnl: 500,
    status: TradeStatus.WIN,
    setup: 'Support Bounce',
    notes: 'Clean setup, waited for confirmation candle.',
    tags: ['Trend']
  },
  {
    id: '2',
    date: '2023-10-02',
    pair: 'GBPUSD',
    type: TradeType.SELL,
    entryPrice: 1.2200,
    exitPrice: 1.2240,
    lotSize: 0.5,
    pnl: -200,
    status: TradeStatus.LOSS,
    setup: 'Breakout',
    notes: 'Fakeout. Should have waited for retest. Felt FOMO.',
    tags: ['Breakout']
  },
  {
    id: '3',
    date: '2023-10-03',
    pair: 'USDJPY',
    type: TradeType.BUY,
    entryPrice: 149.00,
    exitPrice: 149.80,
    lotSize: 1.0,
    pnl: 600,
    status: TradeStatus.WIN,
    setup: 'Trend Continuation',
    notes: 'Added to position as it moved in my favor.',
    tags: ['Trend']
  },
  {
    id: '4',
    date: '2023-10-05',
    pair: 'XAUUSD',
    type: TradeType.SELL,
    entryPrice: 1820,
    exitPrice: 1825,
    lotSize: 0.2,
    pnl: -100,
    status: TradeStatus.LOSS,
    setup: 'Supply Zone',
    notes: 'News event spike took out stop loss.',
    tags: ['Reversal']
  },
  {
    id: '5',
    date: '2023-10-06',
    pair: 'EURUSD',
    type: TradeType.SELL,
    entryPrice: 1.0600,
    exitPrice: 1.0520,
    lotSize: 1.0,
    pnl: 800,
    status: TradeStatus.WIN,
    setup: 'Double Top',
    notes: 'Perfect execution.',
    tags: ['Reversal']
  }
];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [trades, setTrades] = useState<Trade[]>(MOCK_TRADES);
  const [view, setView] = useState<View>('dashboard');
  const [lang, setLang] = useState<Language>('en');

  // Helpers
  const t = (key: TranslationKey) => getTranslation(lang, key);

  // Load data from local storage
  useEffect(() => {
    const savedTrades = localStorage.getItem('protrade_journal');
    if (savedTrades) {
      setTrades(JSON.parse(savedTrades));
    }
    
    const savedUser = localStorage.getItem('protrade_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const savedLang = localStorage.getItem('protrade_lang') as Language;
    if (savedLang) {
      setLang(savedLang);
    }
  }, []);

  // Save data to local storage on change
  useEffect(() => {
    localStorage.setItem('protrade_journal', JSON.stringify(trades));
  }, [trades]);

  // Auto-save interval (every 30 seconds) as a backup
  useEffect(() => {
    const saveInterval = setInterval(() => {
      localStorage.setItem('protrade_journal', JSON.stringify(trades));
    }, 30000);
    return () => clearInterval(saveInterval);
  }, [trades]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('protrade_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('protrade_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('protrade_lang', lang);
  }, [lang]);

  const handleAddTrade = (newTrade: Trade) => {
    setTrades(prev => [newTrade, ...prev]);
    setView('journal');
  };

  const handleDeleteTrade = (id: string) => {
    if (window.confirm('Are you sure you want to delete this trade?')) {
      setTrades(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      setUser(null);
      setView('dashboard');
    }
  };

  // Language Switcher Component
  const LangSwitcher = () => (
    <div className="flex items-center gap-1 bg-midnight-900/50 rounded-lg p-1 border border-white/5">
      {(['en', 'mm', 'rk'] as Language[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${
            lang === l 
              ? 'bg-white/10 text-white shadow-sm' 
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          {l === 'en' ? 'ENG' : l === 'mm' ? 'MYN' : 'RAK'}
        </button>
      ))}
    </div>
  );

  // If not logged in, show Auth screen
  if (!user) {
    return (
      <>
        <div className="absolute top-6 right-6 z-50">
           <LangSwitcher />
        </div>
        <Auth onLogin={handleLogin} lang={lang} />
      </>
    );
  }

  const NavItem = ({ targetView, icon: Icon, label }: { targetView: View, icon: any, label: string }) => (
    <button
      onClick={() => setView(targetView)}
      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 group ${
        view === targetView 
          ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-500/5 text-emerald-400 border border-emerald-500/10 shadow-lg shadow-emerald-900/20' 
          : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={20} className={`${view === targetView ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
        <span className="font-medium tracking-wide text-sm">{label}</span>
      </div>
      {view === targetView && <ChevronRight size={16} className="text-emerald-500/50" />}
    </button>
  );

  return (
    <div className="flex min-h-screen bg-midnight-950 text-slate-200 font-sans overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Background Ambient Effects */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
         <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px] opacity-40"></div>
         <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] opacity-40"></div>
      </div>

      {/* Sidebar */}
      <aside className="w-72 hidden md:flex flex-col h-screen z-20 bg-midnight-950/50 backdrop-blur-xl border-r border-white/5 relative">
        <div className="p-8 mb-2">
          <div className="flex items-center gap-3 mb-1">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-400 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <svg className="w-5 h-5 text-midnight-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
             </div>
             <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-tight">
                ProTrade
             </h1>
          </div>
          <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase pl-11">{t('premium')}</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <div className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('menu')}</div>
          <NavItem targetView="dashboard" icon={LayoutDashboard} label={t('dashboard')} />
          <NavItem targetView="journal" icon={BookOpen} label={t('journal')} />
          <NavItem targetView="analysis" icon={BrainCircuit} label={t('aiCoach')} />
          <NavItem targetView="live-chat" icon={Mic} label={t('liveChat')} />
          
          <div className="px-4 mt-8 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('account')}</div>
          <NavItem targetView="profile" icon={UserIcon} label={t('profile')} />
        </nav>

        <div className="p-6 border-t border-white/5 space-y-4">
          <LangSwitcher />
          <button 
            onClick={() => setView('add-trade')}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white px-4 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/40 border border-emerald-400/20 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <PlusCircle size={20} className="relative z-10" />
            <span className="relative z-10">{t('newEntry')}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-midnight-950/80 backdrop-blur-lg border-b border-white/5 p-4 z-50 flex justify-between items-center">
         <div className="flex items-center gap-2">
             <div className="w-6 h-6 rounded bg-gradient-to-tr from-emerald-400 to-cyan-400"></div>
             <h1 className="text-lg font-bold text-white">ProTrade</h1>
         </div>
         <div className="flex gap-1 items-center">
            <button onClick={() => {
                // Toggle language cycle on mobile
                const next = lang === 'en' ? 'mm' : lang === 'mm' ? 'rk' : 'en';
                setLang(next);
            }} className="p-2 rounded-lg text-slate-400 bg-white/5 mr-2 font-bold text-xs border border-white/5">
                {lang.toUpperCase()}
            </button>
            <button onClick={() => setView('dashboard')} className={`p-2 rounded-lg ${view === 'dashboard' ? 'text-emerald-400 bg-white/5' : 'text-slate-400'}`}><LayoutDashboard size={20}/></button>
            <button onClick={() => setView('journal')} className={`p-2 rounded-lg ${view === 'journal' ? 'text-emerald-400 bg-white/5' : 'text-slate-400'}`}><BookOpen size={20}/></button>
            <button onClick={() => setView('live-chat')} className={`p-2 rounded-lg ${view === 'live-chat' ? 'text-emerald-400 bg-white/5' : 'text-slate-400'}`}><Mic size={20}/></button>
            <button onClick={() => setView('add-trade')} className={`p-2 rounded-lg ${view === 'add-trade' ? 'text-emerald-400 bg-white/5' : 'text-slate-400'}`}><PlusCircle size={20}/></button>
         </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 relative z-10 h-screen overflow-y-auto scroll-smooth">
        <div className="max-w-7xl mx-auto p-6 md:p-12 pt-24 md:pt-12">
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-6 border-b border-white/5">
            <div>
              <h2 className="text-4xl font-bold text-white capitalize tracking-tight">
                {view === 'add-trade' ? t('logTrade') : view === 'analysis' ? t('geminiTitle') : view === 'live-chat' ? t('liveChat') : view === 'dashboard' ? t('dashboard') : view === 'journal' ? t('journal') : t('profile')}
              </h2>
              <p className="text-slate-400 mt-2 text-lg font-light">
                {view === 'dashboard' && `${t('welcome')}, ${user.name.split(' ')[0]}.`}
                {view === 'journal' && t('executionDetails')}
                {view === 'analysis' && t('geminiDesc').substring(0, 50) + '...'}
                {view === 'live-chat' && t('liveVoiceDesc')}
                {view === 'profile' && t('preferences')}
              </p>
            </div>
            <div className="flex items-center gap-4">
               <button 
                  onClick={() => setView('profile')}
                  className="hidden md:flex items-center gap-3 pl-1.5 pr-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all hover:border-white/10 group"
               >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-sm font-bold text-white shadow-md">
                    {user.avatar ? <img src={user.avatar} alt="User" className="w-full h-full object-cover rounded-full"/> : user.name.charAt(0)}
                  </div>
                  <span className="text-sm text-slate-300 font-medium group-hover:text-white transition-colors">{user.name}</span>
               </button>
            </div>
          </header>

          {/* View Content */}
          <div className="animate-fade-in">
            {view === 'dashboard' && <Dashboard trades={trades} lang={lang} />}
            {view === 'journal' && <TradeList trades={trades} onDelete={handleDeleteTrade} lang={lang} />}
            {view === 'add-trade' && <TradeForm onSave={handleAddTrade} onCancel={() => setView('journal')} lang={lang} />}
            {view === 'analysis' && <AIAnalysis trades={trades} lang={lang} />}
            {view === 'live-chat' && <LiveChat lang={lang} />}
            {view === 'profile' && <UserProfile user={user} onLogout={handleLogout} lang={lang} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
