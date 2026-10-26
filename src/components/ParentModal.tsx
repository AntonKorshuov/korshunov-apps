import React, { useState, useEffect } from 'react';
import { UserStats } from '../types';
import { TOPICS } from '../data/curriculum';
import { X, Key, ShieldCheck, Award, TrendingUp, AlertTriangle, RefreshCw, Lock, Save, HardDrive } from 'lucide-react';
import { aiTutor } from '../services/aiTutor';

// Extend window interface for Electron API
declare global {
  interface Window {
    electronAPI?: {
      platform: string;
      saveProgress: (data: unknown) => Promise<{ success: boolean; error?: string }>;
      loadProgress: () => Promise<unknown>;
      checkForUpdates: () => Promise<{ success: boolean; hasUpdate?: boolean; version?: string; description?: string; downloadUrl?: string; error?: string }>;
      applyRemoteUpdate: (url: string) => Promise<{ success: boolean; error?: string }>;
      installUpdate: () => void;
      getAppVersion: () => Promise<string>;
      onUpdateStatus: (callback: (status: { status: string; details?: unknown }) => void) => () => void;
    };
  }
}

interface ParentModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
  onUpdateStats: (newStats: UserStats) => void;
}

export const ParentModal: React.FC<ParentModalProps> = ({
  isOpen,
  onClose,
  stats,
  onUpdateStats
}) => {
  const [apiKey, setApiKey] = useState(stats.geminiApiKey || aiTutor.getApiKey());
  const [savedMessage, setSavedMessage] = useState(false);
  const [newPin, setNewPin] = useState(stats.parentPin || '2026');
  const [pinSaved, setPinSaved] = useState(false);
  const [appVersion, setAppVersion] = useState('1.0.0');
  const [updateStatusText, setUpdateStatusText] = useState<string | null>(null);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.getAppVersion().then(v => setAppVersion(v || '1.0.0'));

      const unsubscribe = window.electronAPI.onUpdateStatus((info) => {
        setIsCheckingUpdate(false);
        if (info.status === 'checking') setUpdateStatusText('Suche nach Updates...');
        else if (info.status === 'available') setUpdateStatusText('🎉 Neues Update gefunden! Wird automatisch im Hintergrund geladen.');
        else if (info.status === 'not-available') setUpdateStatusText('✓ Das Programm ist auf dem neuesten Stand!');
        else if (info.status === 'downloaded') setUpdateStatusText('✨ Update bereit! Wird beim nächsten Schließen installiert.');
        else if (info.status === 'error') setUpdateStatusText('Keine Verbindung zum Update-Server (Offline).');
      });

      return () => unsubscribe();
    }
  }, []);

  if (!isOpen) return null;

  // Calculate statistics
  let totalCorrect = 0;
  let totalAttempted = 0;
  const weakTopics: string[] = [];
  const strongTopics: string[] = [];

  TOPICS.forEach(topic => {
    const prog = stats.topicProgress[topic.id];
    if (prog && prog.totalAttempted > 0) {
      totalCorrect += prog.correctCount;
      totalAttempted += prog.totalAttempted;
      const rate = prog.correctCount / prog.totalAttempted;
      if (rate < 0.65 && prog.totalAttempted >= 3) {
        weakTopics.push(topic.title);
      } else if (rate >= 0.85 && prog.totalAttempted >= 3) {
        strongTopics.push(topic.title);
      }
    }
  });

  const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  const handleSaveApiKey = () => {
    aiTutor.setApiKey(apiKey);
    onUpdateStats({ ...stats, geminiApiKey: apiKey });
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const handleSavePin = () => {
    if (newPin.trim().length >= 4) {
      onUpdateStats({ ...stats, parentPin: newPin.trim() });
      setPinSaved(true);
      setTimeout(() => setPinSaved(false), 3000);
    }
  };

  const handleCheckUpdate = async () => {
    setIsCheckingUpdate(true);
    setUpdateStatusText('Suche nach Updates auf GitHub...');
    if (window.electronAPI) {
      const res = await window.electronAPI.checkForUpdates();
      setIsCheckingUpdate(false);
      if (res.hasUpdate) {
        setUpdateStatusText(`🎉 Neues Update gefunden: v${res.version}! (${res.description || ''})`);
      } else if (res.error) {
        setUpdateStatusText(`Fehler bei der Suche: ${res.error}`);
      } else {
        setUpdateStatusText('✓ Das Programm ist auf dem neuesten Stand!');
      }
    } else {
      setTimeout(() => {
        setIsCheckingUpdate(false);
        setUpdateStatusText('✓ Neueste Version (Web-Modus)');
      }, 800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="bg-slate-800/80 px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>Eltern- & Trainer-Bereich</span>
                <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full font-mono">v{appVersion}</span>
              </h2>
              <p className="text-xs text-slate-400">Geschützt mit persönlicher PIN</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Progress Storage Indicator */}
          <div className="flex items-center justify-between bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 text-xs">
            <div className="flex items-center gap-2.5 text-emerald-300">
              <HardDrive size={18} className="text-emerald-400" />
              <div>
                <strong>Lernfortschritt dauerhaft gesichert:</strong>
                <p className="text-slate-400">Gespeichert in Windows AppData (bleibt auch nach Updates erhalten)</p>
              </div>
            </div>
            <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg">Aktiv ✓</span>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-800/50 border border-slate-700/60 p-4 rounded-2xl text-center">
              <div className="text-sm font-semibold text-slate-400 flex items-center justify-center gap-1.5 mb-1">
                <TrendingUp size={16} className="text-emerald-400" /> Genauigkeit
              </div>
              <div className="text-3xl font-black text-white">{accuracy}%</div>
              <div className="text-xs text-slate-400 mt-1">{totalCorrect} von {totalAttempted} richtig</div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/60 p-4 rounded-2xl text-center">
              <div className="text-sm font-semibold text-slate-400 flex items-center justify-center gap-1.5 mb-1">
                <Award size={16} className="text-amber-400" /> Tore erzielt
              </div>
              <div className="text-3xl font-black text-amber-400">{stats.goalsScored}</div>
              <div className="text-xs text-slate-400 mt-1">Erfolgreiche Treffer</div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/60 p-4 rounded-2xl text-center">
              <div className="text-sm font-semibold text-slate-400 mb-1">
                🔥 Tagesserie
              </div>
              <div className="text-3xl font-black text-orange-400">{stats.currentStreak} Tage</div>
              <div className="text-xs text-slate-400 mt-1">Laufende Serie</div>
            </div>
          </div>

          {/* Pedagogy Insights */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 space-y-3">
            <h4 className="font-bold text-sm text-slate-200 uppercase tracking-wider">Pädagogische Einschätzung</h4>
            
            {strongTopics.length > 0 && (
              <div className="flex items-start gap-2.5 text-sm">
                <span className="text-emerald-400 mt-0.5">✅</span>
                <div>
                  <strong className="text-emerald-300">Stärken:</strong>{' '}
                  <span className="text-slate-300">{strongTopics.join(', ')}</span>
                </div>
              </div>
            )}

            {weakTopics.length > 0 && (
              <div className="flex items-start gap-2.5 text-sm">
                <AlertTriangle size={16} className="text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-amber-300">Empfehlung zum Wiederholen:</strong>{' '}
                  <span className="text-slate-300">{weakTopics.join(', ')}</span>
                </div>
              </div>
            )}

            {totalAttempted === 0 && (
              <p className="text-sm text-slate-400 italic">
                Es wurden noch keine Aufgaben gelöst. Sobald das erste Training startet, erscheinen hier konkrete Auswertungen und Empfehlungen.
              </p>
            )}
          </div>

          {/* PIN Protection Configuration */}
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-slate-200">
              <Lock size={18} className="text-amber-400" />
              <h4 className="font-bold">Eltern-PIN ändern</h4>
            </div>
            <p className="text-xs text-slate-400">
              Passen Sie den 4- bis 6-stelligen Zahlencode an, um den Zugang zum Menü für das Kind zu sperren.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder="2026"
                className="w-32 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-2 text-center text-base font-bold text-white tracking-widest focus:outline-none"
              />
              <button
                onClick={handleSavePin}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-bold transition flex items-center gap-1.5"
              >
                <Save size={16} /> PIN speichern
              </button>
            </div>
            {pinSaved && (
              <div className="text-xs text-emerald-400 font-semibold">
                ✓ Neue PIN erfolgreich gespeichert!
              </div>
            )}
          </div>

          {/* Automatic Updates Section */}
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-200">
                <RefreshCw size={18} className="text-blue-400" />
                <h4 className="font-bold">Automatische Updates</h4>
              </div>
              <button
                onClick={handleCheckUpdate}
                disabled={isCheckingUpdate}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <RefreshCw size={14} className={isCheckingUpdate ? 'animate-spin' : ''} />
                Jetzt nach Updates suchen
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Das Programm prüft beim Start automatisch im Hintergrund nach neuen Mathe-Aufgaben und Updates.
            </p>
            {updateStatusText && (
              <div className="text-xs font-semibold text-blue-300 bg-blue-950/50 border border-blue-800/40 p-2.5 rounded-xl">
                {updateStatusText}
              </div>
            )}
          </div>

          {/* AI Tutor API Config */}
          <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-indigo-300">
              <Key size={18} />
              <h4 className="font-bold">Google Gemini KI-Tutor (Optional)</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tragen Sie Ihren kostenlosen API-Schlüssel ein, um Live-Erklärungen von Trainer Max zu aktivieren.
            </p>

            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
              />
              <button
                onClick={handleSaveApiKey}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition shadow"
              >
                Speichern
              </button>
            </div>

            {savedMessage && (
              <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                ✓ API-Schlüssel erfolgreich gespeichert!
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-800/80 px-6 py-4 border-t border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
