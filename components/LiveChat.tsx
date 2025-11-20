
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { Language } from '../types';
import { getTranslation } from '../translations';
import { Mic, StopCircle, Activity, AlertCircle, Volume2, Waves } from 'lucide-react';

interface LiveChatProps {
  lang: Language;
}

const LiveChat: React.FC<LiveChatProps> = ({ lang }) => {
  const t = (key: any) => getTranslation(lang, key);
  
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for audio handling
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const inputNodeRef = useRef<ScriptProcessorNode | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const languageNames = {
    en: 'English',
    mm: 'Burmese',
    rk: 'Arakanese (Rakhine) or Burmese'
  };

  const startSession = async () => {
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // 1. Setup Audio Contexts
      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      inputAudioContextRef.current = inputAudioContext;
      outputAudioContextRef.current = outputAudioContext;

      const outputNode = outputAudioContext.createGain();
      outputNode.connect(outputAudioContext.destination);
      outputNodeRef.current = outputNode;

      // 2. Request Mic Access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 3. Connect to Gemini Live
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            console.log('Gemini Live Connected');
            setIsConnected(true);
            
            // Stream audio from the microphone to the model.
            const source = inputAudioContext.createMediaStreamSource(stream);
            inputSourceRef.current = source;
            
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            inputNodeRef.current = scriptProcessor;
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              
              // CRITICAL: Solely rely on sessionPromise resolves and then call `session.sendRealtimeInput`
              sessionPromise.then((session: any) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            
            if (base64Audio) {
              setIsSpeaking(true);
              
              // Sync playback time
              nextStartTimeRef.current = Math.max(
                nextStartTimeRef.current,
                outputAudioContext.currentTime
              );
              
              const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                outputAudioContext,
                24000,
                1
              );
              
              const source = outputAudioContext.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputNode);
              
              source.onended = () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) {
                   setIsSpeaking(false);
                }
              };
              
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(source => source.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsSpeaking(false);
            }
          },
          onclose: () => {
            console.log('Gemini Live Closed');
            handleDisconnect();
          },
          onerror: (err) => {
            console.error('Gemini Live Error:', err);
            setError(t('connectionError'));
            handleDisconnect();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          },
          systemInstruction: `You are a professional, calm, and helpful Forex trading assistant. 
          Your goal is to help the user analyzing their trades, discuss market psychology, and provide educational concepts.
          Keep your responses concise and conversational.
          The user speaks ${languageNames[lang]}. Please reply in ${languageNames[lang]}.`
        }
      });
      
      sessionPromiseRef.current = sessionPromise;
      
      // Define cleanup for this session
      cleanupRef.current = () => {
         sessionPromise.then(session => session.close());
      };

    } catch (err) {
      console.error("Failed to start session", err);
      setError(t('micPermission'));
      handleDisconnect();
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setIsSpeaking(false);
    
    // Cleanup Audio
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
    if (inputSourceRef.current) {
        inputSourceRef.current.disconnect();
        inputSourceRef.current = null;
    }
    if (inputNodeRef.current) {
        inputNodeRef.current.disconnect();
        inputNodeRef.current = null;
    }
    
    // Check state before closing to avoid "Cannot close a closed AudioContext" error
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
        inputAudioContextRef.current.close();
    }
    inputAudioContextRef.current = null;

    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
        outputAudioContextRef.current.close();
    }
    outputAudioContextRef.current = null;
    
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();

    if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      handleDisconnect();
    };
  }, []);

  return (
    <div className="max-w-3xl mx-auto animate-fade-in h-[calc(100vh-200px)] flex flex-col justify-center">
      <div className="glass-card p-8 rounded-3xl border border-emerald-500/20 relative overflow-hidden text-center min-h-[400px] flex flex-col items-center justify-center">
        
        {/* Ambient Background */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${isConnected ? 'opacity-100' : 'opacity-20'}`}>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[120px] animate-pulse"></div>
        </div>

        <div className="relative z-10 space-y-10 max-w-md">
            <div>
                <h2 className="text-3xl font-bold text-white mb-3">{t('liveVoiceTitle')}</h2>
                <p className="text-slate-400 leading-relaxed">
                    {t('liveVoiceDesc')}
                </p>
            </div>

            {/* Visualizer Orb */}
            <div className="relative h-40 w-40 mx-auto flex items-center justify-center">
                {/* Rings */}
                <div className={`absolute inset-0 rounded-full border-2 border-emerald-500/30 transition-all duration-1000 ${isConnected ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}></div>
                <div className={`absolute inset-0 rounded-full border border-emerald-500/20 transition-all duration-1000 delay-100 ${isConnected ? 'scale-125 opacity-100' : 'scale-50 opacity-0'}`}></div>
                
                {/* Core Button */}
                <button
                    onClick={isConnected ? handleDisconnect : startSession}
                    className={`relative z-20 w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform hover:scale-105 ${
                        isConnected 
                            ? 'bg-red-500/90 hover:bg-red-600 shadow-red-500/40' 
                            : 'bg-gradient-to-br from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 shadow-emerald-500/40'
                    }`}
                >
                    {isConnected ? <StopCircle size={40} className="text-white" /> : <Mic size={40} className="text-white" />}
                </button>
                
                {/* Pulse Effect when Speaking */}
                {isSpeaking && (
                   <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping"></div>
                )}
            </div>

            {/* Status Indicators */}
            <div className="h-12">
                {error ? (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 text-red-400 text-sm font-bold border border-red-500/20 animate-fade-in">
                        <AlertCircle size={16} /> {error}
                    </div>
                ) : isConnected ? (
                    <div className="flex flex-col items-center gap-2 animate-fade-in">
                        <div className="flex items-center gap-2">
                            {isSpeaking ? (
                                <span className="flex items-center gap-2 text-emerald-400 font-bold">
                                    <Volume2 size={18} className="animate-pulse" /> {t('speaking')}
                                </span>
                            ) : (
                                <span className="flex items-center gap-2 text-slate-300 font-medium">
                                    <Waves size={18} className="animate-pulse" /> {t('listening')}
                                </span>
                            )}
                        </div>
                        <div className="flex gap-1 mt-2 h-4 items-end">
                             {[...Array(5)].map((_, i) => (
                                <div key={i} className={`w-1 bg-emerald-500/50 rounded-full transition-all duration-300 ${isSpeaking ? 'animate-[bounce_1s_infinite]' : 'h-1'}`} style={{height: isSpeaking ? Math.random() * 16 + 4 + 'px' : '4px', animationDelay: `${i * 0.1}s`}}></div>
                             ))}
                        </div>
                    </div>
                ) : (
                    <span className="text-sm text-slate-500 font-medium">{t('connect')}</span>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

// --- Helpers ---

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export default LiveChat;
