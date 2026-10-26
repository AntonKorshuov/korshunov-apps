import React, { useState, useEffect } from 'react';
import { UserStats, TopicInfo } from './types';
import { TOPICS } from './data/curriculum';
import { TopicCard } from './components/TopicCard';
import { TrainingScreen } from './components/TrainingScreen';
import { ParentModal } from './components/ParentModal';
import { ClubPickerModal } from './components/ClubPickerModal';
import { PinModal } from './components/PinModal';
import { sound } from './utils/sound';
import { 
  Star, Shield, Volume2, VolumeX, Settings, 
  Flame, Play, RefreshCw
} from 'lucide-react';

const STORAGE_KEY = 'mathe_champion_5_stats';

const DEFAULT_STATS: UserStats = {
  name: 'Nachwuchs-Stürmer',
  favoriteClub: 'FC Bayern München',
  goalsScored: 0,
  championshipPoints: 0,
  currentStreak: 1,
  lastPlayedDate: new Date().toISOString(),
  parentPin: '2026',
  topicProgress: {},
  trophies: [
    { id: 'first_goal', title: 'Erstes Tor', description: 'Erstes mathematisches Tor erzielt' },
    { id: 'streak_3', title: 'Hattrick', description: '3 Aufgaben hintereinander richtig' },
    { id: 'master_1', title: 'Stellenwert-Ass', description: '3 Sterne in Stellenwerttafel' },
    { id: 'championship', title: 'Meisterpokal', description: '100 Meisterschaftspunkte erspielt' }
  ]
};

export const App: React.FC = () => {
  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return DEFAULT_STATS;
  });

  const [activeTopic, setActiveTopic] = useState<TopicInfo | null>(null);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isParentOpen, setIsParentOpen] = useState(false);
  const [isClubPickerOpen, setIsClubPickerOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(sound.isEnabled());
  const [selectedCategory, setSelectedCategory] = useState<string>('Alle');
  const [remoteUpdate, setRemoteUpdate] = useState<{ version: string; description: string; downloadUrl: string } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Load progress from disk file (Electron AppData) on startup
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.loadProgress().then((diskStats) => {
        if (diskStats && typeof diskStats === 'object') {
          setStats(diskStats as UserStats);
        }
      });

      // Listen for auto-update readiness
      const unsubscribe = window.electronAPI.onUpdateStatus((info) => {
        if (info.status === 'available' && info.details) {
          const det = info.details as { version: string; description: string; downloadUrl: string };
          setRemoteUpdate(det);
        } else if (info.status === 'downloading') {
          setIsUpdating(true);
        }
      });
      return () => unsubscribe();
    }
  }, []);

  // Save progress both to localStorage AND to physical disk file in AppData
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    if (window.electronAPI) {
      window.electronAPI.saveProgress(stats);
    }
  }, [stats]);

  // Calculate total stars
  const totalStars = Object.values(stats.topicProgress).reduce(
    (acc, curr) => acc + (curr.stars || 0),
    0
  );

  const toggleAudio = () => {
    const next = sound.toggleSound();
    setSoundOn(next);
  };

  const handleFinishTraining = (starsEarned: number, correctCount: number, totalCount: number) => {
    if (!activeTopic) return;

    setStats((prev) => {
      const oldProgress = prev.topicProgress[activeTopic.id] || {
        stars: 0,
        correctCount: 0,
        totalAttempted: 0,
        highScore: 0
      };

      const newStars = Math.max(oldProgress.stars, starsEarned);
      const newHighScore = Math.max(oldProgress.highScore, correctCount);
      const pointsGained = correctCount * 10 + (starsEarned === 3 ? 20 : 0);

      return {
        ...prev,
        goalsScored: prev.goalsScored + correctCount,
        championshipPoints: prev.championshipPoints + pointsGained,
        topicProgress: {
          ...prev.topicProgress,
          [activeTopic.id]: {
            stars: newStars,
            correctCount: oldProgress.correctCount + correctCount,
            totalAttempted: oldProgress.totalAttempted + totalCount,
            highScore: newHighScore
          }
        }
      };
    });
  };

  const categories = ['Alle', 'Arithmetik', 'Größen', 'Geometrie', 'Sachaufgaben'];
  const filteredTopics = selectedCategory === 'Alle'
    ? TOPICS
    : TOPICS.filter(t => t.category === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Nunito',sans-serif]">
      {/* Auto-Update Banner */}
      {remoteUpdate && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <RefreshCw size={15} className={isUpdating ? 'animate-spin' : ''} />
            <span>
              🎉 Neues Mathe-Update (v{remoteUpdate.version}): {remoteUpdate.description}
            </span>
          </div>
          <button
            disabled={isUpdating}
            onClick={() => {
              if (window.electronAPI) {
                setIsUpdating(true);
                window.electronAPI.applyRemoteUpdate(remoteUpdate.downloadUrl);
              }
            }}
            className="bg-white text-indigo-700 px-3.5 py-1 rounded-lg text-xs font-black hover:bg-slate-100 transition shadow disabled:opacity-60"
          >
            {isUpdating ? 'Wird aktualisiert...' : 'Jetzt aktualisieren ➔'}
          </button>
        </div>
      )}

      {/* If training session is active */}
      {activeTopic ? (
        <TrainingScreen
          topic={activeTopic}
          onFinish={handleFinishTraining}
          onBack={() => {
            sound.playClick();
            setActiveTopic(null);
          }}
        />
      ) : (
        <>
          {/* Top Bundesliga Header Bar */}
          <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
              {/* App Brand */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center text-xl shadow-lg shadow-emerald-950/60">
                  ⚽
                </div>
                <div>
                  <h1 className="font-black text-lg text-white leading-tight">
                    Mathe-Champion 5
                  </h1>
                  <p className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">
                    Klasse 5 • Realschule & Gesamtschule
                  </p>
                </div>
              </div>

              {/* Club & Stats pill */}
              <div className="hidden md:flex items-center gap-4 bg-slate-950/70 border border-slate-800 px-4 py-1.5 rounded-2xl">
                <button
                  onClick={() => setIsClubPickerOpen(true)}
                  className="flex items-center gap-2 hover:text-emerald-400 transition text-sm font-bold text-slate-200"
                >
                  <Shield size={16} className="text-emerald-400" />
                  <span>{stats.favoriteClub}</span>
                </button>

                <div className="w-px h-5 bg-slate-800" />

                <div className="flex items-center gap-1.5 text-sm font-bold text-amber-400">
                  <Star size={16} className="fill-amber-400" />
                  <span>{totalStars} / 30 Sterne</span>
                </div>

                <div className="w-px h-5 bg-slate-800" />

                <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-400">
                  <span>⚽</span>
                  <span>{stats.goalsScored} Tore</span>
                </div>

                <div className="w-px h-5 bg-slate-800" />

                <div className="flex items-center gap-1.5 text-sm font-bold text-orange-400">
                  <Flame size={16} className="fill-orange-400" />
                  <span>{stats.currentStreak} Tage</span>
                </div>
              </div>

              {/* Actions: Sound & Password-protected Parent Settings */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleAudio}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                  title={soundOn ? 'Ton ausschalten' : 'Ton einschalten'}
                >
                  {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    setIsPinModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs font-bold"
                >
                  <Settings size={16} />
                  <span>Eltern & KI</span>
                </button>
              </div>
            </div>
          </header>

          {/* Main Dashboard Container */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
            {/* Hero Stadium Banner */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-950 border-2 border-emerald-500/30 p-6 md:p-8 shadow-2xl">
              <div className="relative z-10 max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-black">
                  <span>🏆</span> BUNDESLIGA-MATHE-SAISON 2026/2027
                </div>
                <h2 className="text-2xl md:text-4xl font-black text-white leading-tight">
                  Auf den Platz, fertig, rechnen!
                </h2>
                <p className="text-sm md:text-base text-slate-300 leading-relaxed">
                  Trainiere alle 10 Themen der 5. Klasse: Große Zahlen, schriftliches Rechnen, Größen und echte Fußball-Sachaufgaben. Schieße Tore und hole die Meisterschaft!
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => {
                      sound.playClick();
                      const nextTopic = TOPICS.find(t => totalStars >= t.unlockedStarsRequired) || TOPICS[0];
                      setActiveTopic(nextTopic);
                    }}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-900/40 transition transform active:scale-95 flex items-center gap-2"
                  >
                    <Play size={18} className="fill-white" />
                    <span>Jetzt Training starten</span>
                  </button>

                  <div className="text-xs text-slate-400 font-semibold px-3 py-2 bg-slate-900/60 rounded-xl border border-slate-800">
                    Gesamtpunkte: <strong className="text-amber-400 font-bold">{stats.championshipPoints}</strong>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute right-6 -bottom-6 text-9xl opacity-10 pointer-events-none select-none">
                ⚽
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    sound.playClick();
                    setSelectedCategory(cat);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Topics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTopics.map((topic) => {
                const progress = stats.topicProgress[topic.id] || {
                  stars: 0,
                  correctCount: 0,
                  totalAttempted: 0,
                  highScore: 0
                };

                return (
                  <TopicCard
                    key={topic.id}
                    topic={topic}
                    stars={progress.stars}
                    highScore={progress.highScore}
                    totalUserStars={totalStars}
                    onSelect={() => {
                      sound.playClick();
                      setActiveTopic(topic);
                    }}
                  />
                );
              })}
            </div>
          </main>
        </>
      )}

      {/* PIN Check Modal before entering Parent area */}
      <PinModal
        isOpen={isPinModalOpen}
        correctPin={stats.parentPin || '2026'}
        onSuccess={() => setIsParentOpen(true)}
        onClose={() => setIsPinModalOpen(false)}
      />

      {/* Parents Modal */}
      <ParentModal
        isOpen={isParentOpen}
        onClose={() => setIsParentOpen(false)}
        stats={stats}
        onUpdateStats={(newStats) => setStats(newStats)}
      />

      {/* Club Picker Modal */}
      <ClubPickerModal
        isOpen={isClubPickerOpen}
        onClose={() => setIsClubPickerOpen(false)}
        selectedClub={stats.favoriteClub}
        onSelectClub={(club) => setStats({ ...stats, favoriteClub: club })}
      />
    </div>
  );
};
