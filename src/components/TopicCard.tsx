import React from 'react';
import { TopicInfo } from '../types';
import { 
  Lock, Star, Play, 
  Hash, Calculator, PlusSquare, XSquare, 
  DivideSquare, Ruler, Coins, Clock, Box, Trophy
} from 'lucide-react';

interface TopicCardProps {
  topic: TopicInfo;
  stars: number;
  highScore: number;
  totalUserStars: number;
  onSelect: () => void;
}

export const TopicCard: React.FC<TopicCardProps> = ({
  topic,
  stars,
  highScore,
  totalUserStars,
  onSelect
}) => {
  const isLocked = totalUserStars < topic.unlockedStarsRequired;

  const renderIcon = () => {
    switch (topic.iconName) {
      case 'Hash': return <Hash size={24} className="text-emerald-400" />;
      case 'Calculator': return <Calculator size={24} className="text-blue-400" />;
      case 'PlusSquare': return <PlusSquare size={24} className="text-amber-400" />;
      case 'XSquare': return <XSquare size={24} className="text-purple-400" />;
      case 'DivideSquare': return <DivideSquare size={24} className="text-pink-400" />;
      case 'Ruler': return <Ruler size={24} className="text-teal-400" />;
      case 'Coins': return <Coins size={24} className="text-yellow-400" />;
      case 'Clock': return <Clock size={24} className="text-indigo-400" />;
      case 'Box': return <Box size={24} className="text-orange-400" />;
      case 'Trophy': return <Trophy size={24} className="text-amber-300" />;
      default: return <Hash size={24} className="text-emerald-400" />;
    }
  };

  return (
    <div
      onClick={() => !isLocked && onSelect()}
      className={`rounded-3xl border-2 p-5 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group ${
        isLocked
          ? 'bg-slate-900/40 border-slate-800/80 opacity-60 cursor-not-allowed'
          : 'bg-slate-900/90 border-slate-700/80 hover:border-emerald-500/80 hover:shadow-xl hover:shadow-emerald-950/40 cursor-pointer transform hover:-translate-y-1'
      }`}
    >
      <div>
        {/* Top Header of Card */}
        <div className="flex items-center justify-between mb-3">
          <div className="p-2.5 bg-slate-800/90 rounded-2xl border border-slate-700/60 group-hover:scale-110 transition-transform">
            {renderIcon()}
          </div>

          {/* Stars Rating */}
          <div className="flex items-center gap-1 bg-slate-950/60 px-2.5 py-1 rounded-full border border-slate-800">
            {[1, 2, 3].map((starNum) => (
              <Star
                key={starNum}
                size={16}
                className={starNum <= stars ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}
              />
            ))}
          </div>
        </div>

        {/* Category Tag */}
        <span className="text-[10px] font-black tracking-wider uppercase text-emerald-400/90 bg-emerald-500/10 px-2 py-0.5 rounded-md mb-1.5 inline-block">
          {topic.category}
        </span>

        {/* Title & Description */}
        <h3 className="font-extrabold text-base text-white group-hover:text-emerald-300 transition-colors mb-1">
          {topic.title}
        </h3>
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {topic.description}
        </p>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
        {isLocked ? (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
            <Lock size={14} />
            <span>Freischalten ab {topic.unlockedStarsRequired} ⭐</span>
          </div>
        ) : (
          <>
            <span className="text-xs text-slate-400 font-medium">
              Bestwert: <strong className="text-white">{highScore}</strong> Tore
            </span>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
              <span>Starten</span>
              <Play size={14} className="fill-emerald-400" />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
