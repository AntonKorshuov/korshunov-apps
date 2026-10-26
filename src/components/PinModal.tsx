import React, { useState, useEffect } from 'react';
import { Lock, X, Delete } from 'lucide-react';
import { sound } from '../utils/sound';

interface PinModalProps {
  isOpen: boolean;
  correctPin: string;
  onSuccess: () => void;
  onClose: () => void;
}

export const PinModal: React.FC<PinModalProps> = ({
  isOpen,
  correctPin,
  onSuccess,
  onClose
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    sound.playClick();
    if (pin.length < 6) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);

      if (nextPin === correctPin) {
        sound.playCorrect();
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 150);
      } else if (nextPin.length === correctPin.length) {
        sound.playWhistle();
        setError(true);
        setTimeout(() => setPin(''), 600);
      }
    }
  };

  const handleDelete = () => {
    sound.playClick();
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl w-full max-w-sm flex flex-col shadow-2xl p-6 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white rounded-xl transition"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto">
            <Lock size={28} />
          </div>
          <h3 className="text-xl font-black text-white">Eltern-PIN eingeben</h3>
          <p className="text-xs text-slate-400">
            Dieser Bereich ist für Eltern geschützt.
          </p>
          <p className="text-[11px] text-indigo-300 font-semibold bg-indigo-950/40 py-1 px-2 rounded-lg inline-block">
            Standard-PIN: <strong className="font-bold text-white">{correctPin}</strong>
          </p>
        </div>

        {/* PIN Indicators */}
        <div className="flex justify-center gap-3 mb-6">
          {Array.from({ length: correctPin.length }).map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                error
                  ? 'border-red-500 bg-red-500 scale-110'
                  : i < pin.length
                    ? 'border-indigo-400 bg-indigo-500 scale-105'
                    : 'border-slate-700 bg-slate-800'
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="text-center text-xs font-bold text-red-400 mb-3 animate-shake">
            Falsche PIN! Bitte erneut versuchen.
          </div>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto w-full">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(digit)}
              className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-white text-xl font-bold transition active:scale-95 flex items-center justify-center"
            >
              {digit}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleDigit('0')}
            className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-white text-xl font-bold transition active:scale-95 flex items-center justify-center"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition active:scale-95 flex items-center justify-center"
          >
            <Delete size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
