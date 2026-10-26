import React, { useState, useEffect, useRef } from 'react';
import { Exercise, TopicInfo } from '../types';
import { generateExercise } from '../services/exerciseGenerator';
import { aiTutor } from '../services/aiTutor';
import { sound } from '../utils/sound';
import { Scratchpad } from './Scratchpad';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, Volume2, HelpCircle, 
  CheckCircle2, AlertCircle, Edit3, ChevronRight
} from 'lucide-react';

interface TrainingScreenProps {
  topic: TopicInfo;
  onFinish: (starsEarned: number, correctCount: number, totalCount: number) => void;
  onBack: () => void;
}

export const TrainingScreen: React.FC<TrainingScreenProps> = ({
  topic,
  onFinish,
  onBack
}) => {
  const TOTAL_QUESTIONS = 5;
  const [questionIndex, setQuestionIndex] = useState(0);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [scoreCount, setScoreCount] = useState(0);
  const [trainerFeedback, setTrainerFeedback] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Load new question
  const loadQuestion = () => {
    const nextEx = generateExercise(topic.id);
    setExercise(nextEx);
    setUserAnswer('');
    setIsSubmitted(false);
    setIsCorrect(null);
    setTrainerFeedback(null);
    setShowExplanation(false);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  useEffect(() => {
    loadQuestion();
    sound.playWhistle();
    return () => {
      aiTutor.stopSpeaking();
    };
  }, [topic.id]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!exercise || isSubmitted || !userAnswer.trim()) return;

    sound.playKick();
    const cleanUser = userAnswer.trim().replace(/\s/g, '').replace(',', '.');
    const cleanCorrect = String(exercise.correctAnswer).trim().replace(/\s/g, '').replace(',', '.');

    const correct = cleanUser === cleanCorrect || Number(cleanUser) === Number(cleanCorrect);
    setIsSubmitted(true);
    setIsCorrect(correct);

    if (correct) {
      sound.playGoal();
      sound.playCorrect();
      setScoreCount(prev => prev + 1);

      // Trigger Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Fallback
      }

      setTrainerFeedback(aiTutor.getPraiseMessage());
    } else {
      sound.playWhistle();
      setIsLoadingAi(true);
      const feedback = await aiTutor.getFeedbackForMistake(exercise, userAnswer);
      setIsLoadingAi(false);
      setTrainerFeedback(feedback.message);
    }
  };

  const handleNext = () => {
    sound.playClick();
    if (questionIndex + 1 >= TOTAL_QUESTIONS) {
      let stars = 1;
      if (scoreCount >= 4) stars = 3;
      else if (scoreCount >= 2) stars = 2;
      onFinish(stars, scoreCount, TOTAL_QUESTIONS);
    } else {
      setQuestionIndex(prev => prev + 1);
      loadQuestion();
    }
  };

  const handleSpeak = () => {
    if (!exercise) return;
    sound.playClick();
    aiTutor.speakGerman(exercise.question);
  };

  if (!exercise) return null;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between">
      {/* Top Match Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition font-semibold text-sm"
          >
            <ArrowLeft size={18} /> Zurück zur Liga
          </button>
          <div className="border-l border-slate-700 pl-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              ⚽ {topic.title}
            </h2>
            <p className="text-xs text-emerald-400 font-medium">Spielszene {questionIndex + 1} von {TOTAL_QUESTIONS}</p>
          </div>
        </div>

        {/* Score & Tools */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsScratchpadOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 rounded-xl text-sm font-bold transition"
          >
            <Edit3 size={16} /> Schmierzettel
          </button>

          <div className="bg-emerald-950/80 border border-emerald-600/40 px-4 py-1.5 rounded-xl flex items-center gap-2 text-emerald-300 font-extrabold text-sm">
            <span>⚽ Tore:</span>
            <span className="text-white text-base">{scoreCount}</span>
          </div>
        </div>
      </header>

      {/* Main Pitch Arena */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 flex flex-col justify-center">
        {/* Question Card */}
        <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle field markings */}
          <div className="absolute -right-16 -top-16 w-64 h-64 border-8 border-emerald-500/5 rounded-full pointer-events-none" />

          {/* Football scenario badge */}
          {exercise.footballStory && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-4">
              <span>🏟️</span>
              <span>{exercise.footballStory}</span>
            </div>
          )}

          {/* Question Text */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <h3 className="text-xl md:text-2xl font-black text-white leading-relaxed">
              {exercise.question}
            </h3>
            <button
              onClick={handleSpeak}
              title="Aufgabe auf Deutsch vorlesen"
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 rounded-2xl transition shrink-0"
            >
              <Volume2 size={22} />
            </button>
          </div>

          {/* Answer Input Area */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  disabled={isSubmitted}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Deine Antwort eingeben..."
                  className={`w-full bg-slate-950 border-2 rounded-2xl px-5 py-4 text-xl font-bold text-white placeholder-slate-500 transition focus:outline-none ${
                    isSubmitted
                      ? isCorrect
                        ? 'border-emerald-500 bg-emerald-950/20 text-emerald-300'
                        : 'border-red-500 bg-red-950/20 text-red-300'
                      : 'border-slate-700 focus:border-emerald-500'
                  }`}
                />
                {exercise.unit && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    {exercise.unit}
                  </span>
                )}
              </div>

              {!isSubmitted ? (
                <button
                  type="submit"
                  disabled={!userAnswer.trim()}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-lg rounded-2xl shadow-lg shadow-emerald-900/30 transition transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>Tor schießen!</span>
                  <span>⚽</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-lg rounded-2xl shadow-lg shadow-indigo-900/30 transition transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>{questionIndex + 1 < TOTAL_QUESTIONS ? 'Nächste Szene' : 'Spiel abpfeifen'}</span>
                  <ChevronRight size={22} />
                </button>
              )}
            </div>
          </form>

          {/* Feedback & Socratic Hint Box */}
          {isSubmitted && (
            <div className={`mt-6 p-5 rounded-2xl border transition-all animate-fadeIn ${
              isCorrect 
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200' 
                : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
            }`}>
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <CheckCircle2 size={24} className="text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle size={24} className="text-amber-400 shrink-0 mt-0.5" />
                )}
                
                <div className="flex-1 space-y-2">
                  <div className="font-extrabold text-base flex items-center gap-2">
                    {isCorrect ? 'Volltreffer!' : 'Knapp am Pfosten vorbei!'}
                    {isLoadingAi && <span className="text-xs text-amber-400 animate-pulse">Trainer überlegt...</span>}
                  </div>

                  {trainerFeedback && (
                    <p className="text-sm leading-relaxed text-slate-200">
                      {trainerFeedback}
                    </p>
                  )}

                  {!isCorrect && (
                    <div className="pt-2">
                      <button
                        onClick={() => setShowExplanation(!showExplanation)}
                        className="text-xs font-bold text-amber-300 hover:underline flex items-center gap-1"
                      >
                        <HelpCircle size={14} />
                        {showExplanation ? 'Lösungsweg verbergen' : 'Vollständigen Lösungsweg anzeigen'}
                      </button>

                      {showExplanation && (
                        <div className="mt-2 p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                          <strong>Richtige Lösung:</strong> {exercise.correctAnswer} {exercise.unit || ''}
                          <br />
                          <strong>Lösungsweg:</strong> {exercise.explanation}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Progress Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="flex-1 bg-slate-800 h-3 rounded-full overflow-hidden p-0.5">
            <div
              className="bg-gradient-to-r from-emerald-500 to-green-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${((questionIndex + (isSubmitted ? 1 : 0)) / TOTAL_QUESTIONS) * 100}%` }}
            />
          </div>
          <span className="text-xs font-bold text-slate-400 shrink-0">
            {questionIndex + (isSubmitted ? 1 : 0)} / {TOTAL_QUESTIONS} Szenen
          </span>
        </div>
      </footer>

      {/* Scratchpad whiteboard modal */}
      <Scratchpad
        isOpen={isScratchpadOpen}
        onClose={() => setIsScratchpadOpen(false)}
      />
    </div>
  );
};
