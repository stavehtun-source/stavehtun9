
import React, { useState } from 'react';
import { User, Language } from '../types';
import { getTranslation } from '../translations';
import { Mail, Lock, User as UserIcon, ArrowRight, ShieldCheck } from 'lucide-react';

// Icons for providers
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.21h-.19z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 2.848-5.978 5.817-5.978.989 0 2.017.046 3.023.138v3.548h-1.938c-2.306 0-2.685 1.184-2.685 2.73v1.143h3.924l-.499 3.667h-3.425v7.98H9.101z" />
  </svg>
);

const WhatsAppIcon = () => (
   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
   </svg>
);

interface AuthProps {
  onLogin: (user: User) => void;
  lang: Language;
}

const Auth: React.FC<AuthProps> = ({ onLogin, lang }) => {
  const t = (key: any) => getTranslation(lang, key);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMockLogin = (provider: User['provider']) => {
    setLoading(true);
    // Simulate network delay
    setTimeout(() => {
        const mockUser: User = {
            id: crypto.randomUUID(),
            name: provider === 'email' ? (name || 'Trader Joe') : `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
            email: provider === 'email' ? email : `user@${provider}.com`,
            provider: provider,
            joinedDate: new Date().toISOString().split('T')[0],
            avatar: provider !== 'email' ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}` : undefined
        };
        onLogin(mockUser);
        setLoading(false);
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleMockLogin('email');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-midnight-950 relative overflow-hidden px-4">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
         <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-emerald-600/20 rounded-full blur-[120px] animate-pulse"></div>
         <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md glass-card p-10 rounded-3xl relative z-10 animate-fade-in shadow-2xl shadow-black/50">
        <div className="text-center mb-10">
            <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-emerald-400 to-cyan-400 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
                <ShieldCheck size={32} className="text-midnight-950" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
                {isLogin ? t('welcomeBack') : t('createAccount')}
            </h1>
            <p className="text-slate-400 text-sm mt-2">
                {isLogin ? t('enterCreds') : t('joinThousands')}
            </p>
        </div>

        {/* Social Logins */}
        <div className="grid grid-cols-3 gap-4 mb-8">
            {[
                { icon: GoogleIcon, provider: 'google', bg: 'hover:bg-white/10' },
                { icon: FacebookIcon, provider: 'facebook', bg: 'hover:bg-[#1877F2]/20 hover:border-[#1877F2]/50 hover:text-[#1877F2]' },
                { icon: WhatsAppIcon, provider: 'whatsapp', bg: 'hover:bg-[#25D366]/20 hover:border-[#25D366]/50 hover:text-[#25D366]' }
            ].map((item) => (
                <button 
                    key={item.provider}
                    onClick={() => handleMockLogin(item.provider as any)}
                    className={`flex items-center justify-center py-3 bg-midnight-950 border border-white/10 rounded-xl transition-all text-slate-300 ${item.bg} hover:scale-105`}
                >
                    <item.icon />
                </button>
            ))}
        </div>

        <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                <span className="px-3 bg-[#0f172a] text-slate-500">{t('orContinue')}</span>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
                 <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <UserIcon size={18} className="text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder={t('fullName')}
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-midnight-950/50 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-slate-200 placeholder-slate-600 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all"
                    />
                </div>
            )}
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail size={18} className="text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                </div>
                <input
                    type="email"
                    placeholder={t('emailAddr')}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-midnight-950/50 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-slate-200 placeholder-slate-600 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all"
                />
            </div>
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={18} className="text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                </div>
                <input
                    type="password"
                    placeholder={t('password')}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-midnight-950/50 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-slate-200 placeholder-slate-600 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
            >
                {loading ? t('authenticating') : (isLogin ? t('signIn') : t('createAccount'))}
                {!loading && <ArrowRight size={18} />}
            </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-400">
            {isLogin ? t('newMember') : t('alreadyMember')}
            <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline focus:outline-none ml-1"
            >
                {isLogin ? t('createAccount') : t('signIn')}
            </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
