import React from 'react';
import { BUNDESLIGA_CLUBS } from '../data/curriculum';
import { X, Shield } from 'lucide-react';
import { sound } from '../utils/sound';

interface ClubPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedClub: string;
  onSelectClub: (clubName: string) => void;
}

export const ClubPickerModal: React.FC<ClubPickerModalProps> = ({
  isOpen,
  onClose,
  selectedClub,
  onSelectClub
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden">
        <div className="bg-slate-800/80 px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Shield size={22} className="text-emerald-400" />
            <h3 className="font-extrabold text-lg text-white">Wähle deinen Lieblingsverein</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto">
          {BUNDESLIGA_CLUBS.map((club) => {
            const isSelected = selectedClub === club.name;
            return (
              <button
                key={club.name}
                onClick={() => {
                  sound.playClick();
                  onSelectClub(club.name);
                  onClose();
                }}
                className={`p-4 rounded-2xl border-2 text-left transition flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-900/20'
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                }`}
              >
                <div className="font-bold text-white text-base mb-1 flex items-center justify-between">
                  <span>{club.name}</span>
                  {isSelected && <span className="text-emerald-400 text-sm">✓</span>}
                </div>
                <div className="text-xs text-slate-400">
                  {club.stadium}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
