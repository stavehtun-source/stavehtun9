
import React, { useState } from 'react';
import { Trade, Language } from '../types';
import { getTranslation } from '../translations';
import { analyzeTradingJournal } from '../services/geminiService';
import { Sparkles, RefreshCw, BrainCircuit } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIAnalysisProps {
  trades: Trade[];
  lang: Language;
}

const AIAnalysis: React.FC<AIAnalysisProps> = ({ trades, lang }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const t = (key: any) => getTranslation(lang, key);

  const handleAnalyze = async () => {
    setLoading(true);
    const result = await analyzeTradingJournal(trades, lang);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="glass-card p-8 rounded-3xl border border-indigo-500/20 relative overflow-hidden">
        {/* Gradient sheen */}
        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-indigo-600/10 to-transparent pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
               <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                 <BrainCircuit size={24} />
               </div>
               <h2 className="text-2xl font-bold text-white">{t('geminiTitle')}</h2>
            </div>
            <p className="text-slate-300 max-w-lg leading-relaxed text-sm md:text-base">
              {t('geminiDesc')}
            </p>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className={`px-8 py-4 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-3 whitespace-nowrap border border-indigo-400/20 ${
              loading 
                ? 'bg-indigo-600/50 cursor-wait' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 hover:scale-105 hover:shadow-indigo-500/40'
            }`}
          >
            {loading ? (
              <>
                <RefreshCw className="animate-spin" /> {t('analyzing')}
              </>
            ) : (
              <>
                <Sparkles size={20} /> {t('analyzeBtn')}
              </>
            )}
          </button>
        </div>
      </div>

      {analysis && (
        <div className="glass-card p-8 md:p-10 rounded-3xl shadow-xl border-t border-white/10 bg-[#0B0F1A]/80">
          <div className="prose prose-invert max-w-none">
             <ReactMarkdown
                components={{
                    h1: ({node, ...props}) => (
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mt-2 mb-6 pb-4 border-b border-white/5" {...props} />
                    ),
                    h2: ({node, ...props}) => (
                        <h2 className="text-xl font-bold text-white mt-8 mb-4 flex items-center gap-3" {...props}>
                            <span className="w-2 h-8 rounded-full bg-indigo-500 inline-block"></span>
                            {props.children}
                        </h2>
                    ),
                    h3: ({node, ...props}) => (
                        <h3 className="text-lg font-semibold text-indigo-300 mt-6 mb-3" {...props} />
                    ),
                    ul: ({node, ...props}) => (
                        <ul className="space-y-2 mb-6 ml-1" {...props} />
                    ),
                    li: ({node, ...props}) => (
                        <li className="text-slate-300 flex items-start gap-2" {...props}>
                            <span className="text-indigo-500 mt-1.5">•</span>
                            <span>{props.children}</span>
                        </li>
                    ),
                    strong: ({node, ...props}) => (
                        <strong className="text-white font-bold" {...props} />
                    ),
                    p: ({node, ...props}) => (
                        <p className="text-slate-400 leading-relaxed mb-4" {...props} />
                    ),
                    blockquote: ({node, ...props}) => (
                        <blockquote className="border-l-4 border-indigo-500/50 pl-4 py-1 my-4 bg-white/5 rounded-r-lg text-slate-300 italic" {...props} />
                    )
                }}
             >
                {analysis}
             </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;
