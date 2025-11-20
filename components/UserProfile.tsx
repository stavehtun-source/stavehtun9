
import React from 'react';
import { User, Language } from '../types';
import { getTranslation } from '../translations';
import { LogOut, Mail, Calendar, Shield, CreditCard, Smartphone, Globe, Settings, Bell, ChevronRight } from 'lucide-react';

interface UserProfileProps {
  user: User;
  onLogout: () => void;
  lang: Language;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onLogout, lang }) => {
  const t = (key: any) => getTranslation(lang, key);

  const SettingItem = ({ icon: Icon, label, sub }: any) => (
     <button className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all group border border-white/5">
        <div className="flex items-center gap-4">
            <div className="p-2 bg-midnight-950 rounded-lg text-slate-400 group-hover:text-emerald-400 transition-colors">
                <Icon size={20} />
            </div>
            <div className="text-left">
                <p className="text-slate-200 font-medium">{label}</p>
                <p className="text-xs text-slate-500">{sub}</p>
            </div>
        </div>
        <ChevronRight size={18} className="text-slate-600 group-hover:text-white transition-colors" />
     </button>
  );

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="glass-card rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Header/Banner */}
        <div className="h-40 bg-gradient-to-r from-emerald-600 via-cyan-600 to-indigo-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"></div>
            <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <div className="px-8 pb-8 relative">
            {/* Avatar - floating over banner */}
            <div className="flex justify-between items-end -mt-12 mb-6">
                <div className="w-28 h-28 rounded-2xl border-4 border-midnight-900 bg-midnight-800 overflow-hidden flex items-center justify-center shadow-xl relative z-10">
                    {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-4xl font-bold text-emerald-400">
                            {user.name.charAt(0).toUpperCase()}
                        </span>
                    )}
                </div>
                <div className="mb-2">
                     <span className={`px-4 py-1.5 rounded-full text-xs font-bold border uppercase tracking-wider flex items-center gap-2 ${
                        user.provider === 'whatsapp' ? 'bg-[#25D366]/10 text-[#25D366] border-[#25D366]/20' : 
                        user.provider === 'facebook' ? 'bg-[#1877F2]/10 text-[#1877F2] border-[#1877F2]/20' :
                        user.provider === 'google' ? 'bg-white/10 text-white border-white/20' :
                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                        {user.provider === 'whatsapp' && <Smartphone size={14}/>}
                        {user.provider === 'facebook' && <Globe size={14}/>}
                        {user.provider}
                    </span>
                </div>
            </div>

            {/* User Info */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white tracking-tight">{user.name}</h2>
                <p className="text-slate-400 flex items-center gap-2 mt-1 font-medium">
                    <Mail size={16} /> {user.email}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-5 bg-midnight-950/50 rounded-2xl border border-white/5 flex flex-col gap-1">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{t('memberSince')}</p>
                    <div className="flex items-center gap-2 text-slate-200 font-bold text-lg">
                         <Calendar size={18} className="text-emerald-500"/>
                         {new Date(user.joinedDate).toLocaleDateString()}
                    </div>
                </div>
                <div className="p-5 bg-midnight-950/50 rounded-2xl border border-white/5 flex flex-col gap-1">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{t('accountStatus')}</p>
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg">
                         <Shield size={18} />
                         PRO Plan Active
                    </div>
                </div>
            </div>

            {/* Settings List */}
            <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">{t('preferences')}</h3>
                <SettingItem icon={CreditCard} label={t('subscription')} sub={t('subDesc')} />
                <SettingItem icon={Bell} label={t('notifications')} sub={t('notifDesc')} />
                <SettingItem icon={Settings} label={t('appSettings')} sub={t('appSetDesc')} />
            </div>

             <div className="mt-10 pt-6 border-t border-white/5">
                <button 
                    onClick={onLogout}
                    className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all font-bold"
                >
                    <LogOut size={20} />
                    {t('signOut')}
                </button>
             </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
