import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import TradeList from './components/TradeList';
import TradeForm from './components/TradeForm';
import AIAnalysis from './components/AIAnalysis';
import LiveChat from './components/LiveChat';
import Auth from './components/Auth';
import UserProfile from './components/UserProfile';
import { Trade, TradeStatus, TradeType, View, User, Language } from './types';
import { getTranslation, TranslationKey } from './translations';
import { LayoutDashboard, BookOpen, PlusCircle, BrainCircuit, LogOut, User as UserIcon, Settings, ChevronRight, Globe, Mic, Plus } from 'lucide-react';

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
    exitPrice: 149.50,
    lotSize: 0.8,
    pnl: 350,
    status: TradeStatus.WIN,
    setup: 'Trendline Break',
    notes: 'Strong momentum on 1H timeframe.',
    tags: ['Trend']
  }
];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [trades, setTrades] = useState<Trade[]>(MOCK_TRADES);
  const [language, setLanguage] = useState<Language>('en');

  // Auto-save whole journal backup
  useEffect(() => {
    if (user) {
      const backupInterval = setInterval(() => {
        localStorage.setItem('protrade_backup_trades', JSON.stringify(trades));
      }, 30000);
      return () => clearInterval(backupInterval);
    }
  }, [trades, user]);

  // Restore backup on load
  useEffect(() => {
    const backup = localStorage.getItem('protrade_backup_trades');
    if (backup) {
      try {
        setTrades(JSON.parse(backup));
      } catch (e) {
        console.error("Failed to load backup", e);
      }
    }
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('dashboard');
  };

  const handleSaveTrade = (newTrade: Trade) => {
    setTrades([newTrade, ...trades]);
    setCurrentView('journal');
  };

  const handleDeleteTrade = (id: string) => {
    if (confirm('Are you sure you want to delete this trade?')) {
      setTrades(trades.filter(t => t.id !== id));
    }
  };

  const t = (key: TranslationKey) => getTranslation(language, key);

  const NavItem = ({ view, icon: Icon, label, isMobile = false }: { view: View, icon: any, label: string, isMobile?: boolean }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`${
        isMobile 
        ? 'flex flex-col items-center gap-1 p-2 flex-1' 
        : 'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-1'
      } ${
        currentView === view
          ? isMobile ? 'text-emerald-400' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
      }`}
    >
      <Icon size={isMobile ? 24 : 20} strokeWidth={currentView === view ? 2.5 : 2} />
      <span className={isMobile ? "text-[10px] font-medium" : "font-medium"}>{label}</span>
    </button>
  );

  if (!user) {
    return <Auth onLogin={handleLogin} lang={language} />;
  }

  return (
    <div className="min-h-screen bg-midnight-950 text-slate-200 font-sans selection:bg-emerald-500/30 flex flex-col md:flex-row">
      
      {/* --- Desktop Sidebar (Hidden on Mobile) --- */}
      <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-midnight-900 border-r border-white/5 p-6 z-50">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
             <span className="font-bold text-white text-lg">P</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">ProTrade<span className="text-emerald-400">.AI</span></h1>
        </div>

        <nav className="flex-1 space-y-1">
          <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-2">{t('menu')}</p>
          <NavItem view="dashboard" icon={LayoutDashboard} label={t('dashboard')} />
          <NavItem view="journal" icon={BookOpen} label={t('journal')} />
          <NavItem view="add-trade" icon={PlusCircle} label={t('newEntry')} />
          
          <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-8">{t('premium')}</p>
          <NavItem view="analysis" icon={BrainCircuit} label={t('aiCoach')} />
          <NavItem view="live-chat" icon={Mic} label={t('liveChat')} />

          <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-8">{t('account')}</p>
          <NavItem view="profile" icon={UserIcon} label={t('profile')} />
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
           <div className="bg-midnight-800 rounded-xl p-3 flex items-center gap-3 border border-white/5 mb-4">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                 {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                 <p className="text-sm font-bold text-white truncate">{user.name}</p>
                 <p className="text-xs text-emerald-400">Pro Member</p>
              </div>
           </div>
           
           {/* Language Switcher Desktop */}
           <div className="flex bg-midnight-950 rounded-lg p-1 mb-3 border border-white/5">
              {(['en', 'mm', 'rk'] as Language[]).map(l => (
                  <button 
                    key={l}
                    onClick={() => setLanguage(l)}
                    className={`flex-1 py-1 text-xs font-bold rounded uppercase transition-colors ${language === l ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    {l}
                  </button>
              ))}
           </div>
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <main className="flex-1 relative min-w-0 pb-24 md:pb-0 overflow-y-auto h-screen">
        
        {/* Mobile Top Header (Safe Area) */}
        <header className="md:hidden sticky top-0 z-40 bg-midnight-950/80 backdrop-blur-md border-b border-white/5 px-4 pt-[env(safe-area-inset-top)] pb-3">
           <div className="flex justify-between items-center pt-3">
              <div className="flex items-center gap-2">
                 <div className="w-7 h-7 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <span className="font-bold text-white text-sm">P</span>
                 </div>
                 <h1 className="font-bold text-white text-lg">ProTrade</h1>
              </div>
              <div className="flex items-center gap-3">
                 {/* Lang Switcher Mobile */}
                 <button 
                    onClick={() => setLanguage(prev => prev === 'en' ? 'mm' : prev === 'mm' ? 'rk' : 'en')}
                    className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 border border-white/5 text-xs font-bold uppercase"
                 >
                    {language}
                 </button>
                 <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs border border-emerald-500/30">
                    {user.name.charAt(0)}
                 </div>
              </div>
           </div>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {currentView === 'dashboard' && <Dashboard trades={trades} lang={language} />}
          {currentView === 'journal' && <TradeList trades={trades} onDelete={handleDeleteTrade} lang={language} />}
          {currentView === 'add-trade' && <TradeForm onSave={handleSaveTrade} onCancel={() => setCurrentView('dashboard')} lang={language} />}
          {currentView === 'analysis' && <AIAnalysis trades={trades} lang={language} />}
          {currentView === 'live-chat' && <LiveChat lang={language} />}
          {currentView === 'profile' && <UserProfile user={user} onLogout={handleLogout} lang={language} />}
        </div>
      </main>

      {/* --- Android Bottom Navigation Bar --- */}
      <nav className="md:hidden fixed bottom-0 w-full bg-midnight-950/90 backdrop-blur-xl border-t border-white/10 z-50 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-between px-2 py-2">
            <NavItem isMobile view="dashboard" icon={LayoutDashboard} label={t('dashboard')} />
            <NavItem isMobile view="journal" icon={BookOpen} label={t('journal')} />
            
            {/* Floating Add Button */}
            <div className="relative -top-6">
                <button 
                    onClick={() => setCurrentView('add-trade')}
                    className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/30 flex items-center justify-center text-white transform transition-transform active:scale-90 border-4 border-midnight-950"
                >
                    <Plus size={28} strokeWidth={3} />
                </button>
            </div>

            <NavItem isMobile view="live-chat" icon={Mic} label="AI Voice" />
            <NavItem isMobile view="analysis" icon={BrainCircuit} label="Coach" />
        </div>
      </nav>

    </div>
  );
};

export default App;