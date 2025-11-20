
import React, { useMemo, useState } from 'react';
import { Trade, TradeStatus, Language } from '../types';
import { getTranslation } from '../translations';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, ReferenceLine
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity, Calendar, Target, ShieldAlert, BarChart3 } from 'lucide-react';

interface DashboardProps {
  trades: Trade[];
  lang: Language;
}

type TimeRange = 'all' | '7d' | '30d' | 'this_month' | 'last_month';

const Dashboard: React.FC<DashboardProps> = ({ trades, lang }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const t = (key: any) => getTranslation(lang, key);

  // Filter trades based on time range
  const filteredTrades = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return trades.filter(trade => {
      const tradeDate = new Date(trade.date);
      switch (timeRange) {
        case '7d':
          const sevenDaysAgo = new Date(today);
          sevenDaysAgo.setDate(today.getDate() - 7);
          return tradeDate >= sevenDaysAgo;
        case '30d':
          const thirtyDaysAgo = new Date(today);
          thirtyDaysAgo.setDate(today.getDate() - 30);
          return tradeDate >= thirtyDaysAgo;
        case 'this_month':
          return tradeDate.getMonth() === now.getMonth() && tradeDate.getFullYear() === now.getFullYear();
        case 'last_month':
           const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
           const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
           return tradeDate >= firstDayLastMonth && tradeDate <= lastDayLastMonth;
        case 'all':
        default:
          return true;
      }
    });
  }, [trades, timeRange]);

  const stats = useMemo(() => {
    const totalTrades = filteredTrades.length;
    const wins = filteredTrades.filter(t => t.status === TradeStatus.WIN).length;
    const losses = filteredTrades.filter(t => t.status === TradeStatus.LOSS).length;
    const breakEvens = filteredTrades.filter(t => t.status === TradeStatus.BE).length;
    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
    const totalPnL = filteredTrades.reduce((sum, t) => sum + t.pnl, 0);
    
    const winningTrades = filteredTrades.filter(t => t.pnl > 0);
    const losingTrades = filteredTrades.filter(t => t.pnl < 0);
    
    const avgWin = winningTrades.length > 0 
      ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length 
      : 0;
    const avgLoss = losingTrades.length > 0 
      ? Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length) 
      : 0;
    
    const profitFactor = avgLoss > 0 ? (avgWin * wins) / (avgLoss * losses) : (wins > 0 ? 999 : 0);
    const riskRewardRatio = avgLoss > 0 ? avgWin / avgLoss : 0;

    // Max Drawdown Calculation
    const sortedTrades = [...filteredTrades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let peak = 0;
    let maxDrawdown = 0;
    let runningBalance = 0;

    sortedTrades.forEach(trade => {
        runningBalance += trade.pnl;
        if (runningBalance > peak) {
            peak = runningBalance;
        }
        const drawdown = peak - runningBalance;
        if (drawdown > maxDrawdown) {
            maxDrawdown = drawdown;
        }
    });

    return {
      totalTrades,
      winRate,
      totalPnL,
      avgWin,
      avgLoss,
      profitFactor,
      riskRewardRatio,
      maxDrawdown
    };
  }, [filteredTrades]);

  // Prepare Equity Curve Data
  const equityData = useMemo(() => {
    let runningBalance = 0;
    const sortedTrades = [...filteredTrades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    if (sortedTrades.length === 0) return [];

    return sortedTrades.map(trade => {
      runningBalance += trade.pnl;
      return {
        date: trade.date,
        balance: runningBalance,
        pnl: trade.pnl
      };
    });
  }, [filteredTrades]);

  // Performance by Pair
  const pairData = useMemo(() => {
    const pairMap: Record<string, number> = {};
    filteredTrades.forEach(t => {
      pairMap[t.pair] = (pairMap[t.pair] || 0) + t.pnl;
    });
    return Object.entries(pairMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTrades]);

  // Win/Loss Pie Data
  const pieData = [
    { name: 'Wins', value: filteredTrades.filter(t => t.status === TradeStatus.WIN).length },
    { name: 'Losses', value: filteredTrades.filter(t => t.status === TradeStatus.LOSS).length },
    { name: 'BE', value: filteredTrades.filter(t => t.status === TradeStatus.BE).length },
  ].filter(item => item.value > 0);
  
  const PIE_COLORS = ['#10b981', '#ef4444', '#f59e0b'];

  const formatCurrency = (val: number) => `$${val.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

  const MetricCard = ({ label, value, subValue, icon: Icon, trend, colorClass }: any) => (
    <div className="glass-card p-5 rounded-2xl relative overflow-hidden group transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/10">
      <div className={`absolute top-0 right-0 w-24 h-24 opacity-5 -mr-4 -mt-4 rounded-full transition-transform group-hover:scale-110 ${colorClass.replace('text-', 'bg-')}`}></div>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-xl ${colorClass.replace('text-', 'bg-').replace('400', '500/10')} ${colorClass}`}>
           <Icon size={22} strokeWidth={2.5} />
        </div>
        {trend && (
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {trend === 'up' ? '↑' : '↓'}
            </span>
        )}
      </div>
      <div>
         <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
         <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
         {subValue && <p className="text-slate-500 text-xs mt-1 font-medium">{subValue}</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 glass-panel p-2 rounded-2xl">
        <div className="px-4 py-2 flex items-center gap-3">
            <div className="w-2 h-8 rounded-full bg-emerald-500"></div>
            <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">{t('perfOverview')}</h3>
                <p className="text-xs text-slate-400">{t('realTimeMetrics')}</p>
            </div>
        </div>
        <div className="flex bg-midnight-800/50 p-1 rounded-xl border border-white/5 overflow-x-auto w-full md:w-auto no-scrollbar">
            {(['all', '7d', '30d', 'this_month', 'last_month'] as TimeRange[]).map((range) => (
                <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                        timeRange === range 
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/20' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    {range === 'all' ? 'All' : range.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </button>
            ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard 
            label={t('netProfit')}
            value={formatCurrency(stats.totalPnL)}
            icon={DollarSign}
            colorClass={stats.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}
            trend={stats.totalPnL >= 0 ? 'up' : 'down'}
        />
        <MetricCard 
            label={t('winRate')}
            value={`${stats.winRate.toFixed(1)}%`}
            subValue={`${stats.totalTrades} ${t('totalTrades')}`}
            icon={Target}
            colorClass="text-blue-400"
        />
        <MetricCard 
            label={t('profitFactor')}
            value={stats.profitFactor === 999 ? '∞' : stats.profitFactor.toFixed(2)}
            subValue={`${t('target')}: > 1.5`}
            icon={BarChart3}
            colorClass={stats.profitFactor >= 1.5 ? 'text-emerald-400' : 'text-yellow-400'}
        />
        <MetricCard 
            label={t('maxDrawdown')}
            value={`-${formatCurrency(stats.maxDrawdown)}`}
            subValue={t('fromPeak')}
            icon={ShieldAlert}
            colorClass="text-red-400"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equity Curve */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <div className="flex justify-between items-center mb-8">
             <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {t('equityCurve')}
                </h3>
                <p className="text-xs text-slate-400 mt-1">{t('cumulativePnl')}</p>
             </div>
             <div className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                {t('liveData')}
             </div>
          </div>
          
          <div className="h-[350px] w-full">
            {equityData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#475569" 
                  tick={{fontSize: 10, fill: '#64748b'}}
                  tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                    stroke="#475569" 
                    tick={{fontSize: 10, fill: '#64748b'}} 
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `$${val}`}
                />
                <Tooltip 
                  contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderColor: 'rgba(255,255,255,0.1)', 
                      borderRadius: '8px',
                      color: '#f1f5f9',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                  }}
                  itemStyle={{ color: '#10b981' }}
                  formatter={(value: number) => [formatCurrency(value), 'Balance']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorPnl)" 
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3">
                    <Activity size={48} className="opacity-20"/>
                    <p className="text-sm">{t('noTrades')}</p>
                </div>
            )}
          </div>
        </div>

        {/* Side Analysis */}
        <div className="space-y-6">
            {/* Win Ratio */}
            <div className="glass-card p-6 rounded-2xl h-[240px] flex flex-col">
                <h3 className="text-sm font-bold text-white mb-4">{t('winLossRatio')}</h3>
                <div className="flex-1 min-h-0 relative">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={70}
                                paddingAngle={8}
                                dataKey="value"
                                stroke="none"
                            >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                                itemStyle={{color: '#fff'}}
                            />
                        </PieChart>
                     </ResponsiveContainer>
                     {/* Centered Text */}
                     <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-bold text-white">{stats.winRate.toFixed(0)}%</span>
                     </div>
                </div>
            </div>

             {/* Pair Perf */}
             <div className="glass-card p-6 rounded-2xl h-[240px] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-white">{t('topPairs')}</h3>
                    <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-1 rounded">P&L</span>
                </div>
                 <div className="flex-1 min-h-0">
                     {pairData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={pairData.slice(0, 4)} layout="vertical" margin={{left: 0, right: 0}}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)"/>
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    width={55} 
                                    tick={{fontSize: 11, fill: '#94a3b8', fontWeight: 600}} 
                                    axisLine={false} 
                                    tickLine={false}
                                />
                                <Tooltip 
                                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                                    formatter={(val: number) => formatCurrency(val)}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                    {pairData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#10b981' : '#ef4444'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                     ) : (
                        <div className="h-full flex items-center justify-center text-slate-600 text-xs">No Data</div>
                     )}
                 </div>
             </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
