import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Pen, Trash2, X } from 'lucide-react';

interface ScratchpadProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Scratchpad: React.FC<ScratchpadProps> = ({ isOpen, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState<'pen' | 'eraser'>('pen');
  const [color, setColor] = useState('#fbbf24'); // Yellow chalk color
  const [lineWidth] = useState(3);

  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas properly
    canvas.width = canvas.parentElement?.clientWidth || 600;
    canvas.height = canvas.parentElement?.clientHeight || 400;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [isOpen]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if (mode === 'eraser') {
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 20;
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
    }

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-2xl w-full max-w-3xl h-[560px] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-800 px-5 py-3 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📝</span>
            <h3 className="font-bold text-lg text-emerald-400">Schmierzettel & Notizen</h3>
            <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">Hier kannst du Nebenrechnungen machen!</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Canvas area */}
        <div className="flex-1 relative bg-slate-950 cursor-crosshair">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-full block"
          />
        </div>

        {/* Toolbar */}
        <div className="bg-slate-800/90 px-4 py-3 border-t border-slate-700 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode('pen')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                mode === 'pen' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <Pen size={16} /> Stift
            </button>
            <button
              onClick={() => setMode('eraser')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                mode === 'eraser' ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <Eraser size={16} /> Radierer
            </button>
            
            {mode === 'pen' && (
              <div className="flex items-center gap-1.5 ml-3 pl-3 border-l border-slate-700">
                {['#fbbf24', '#38bdf8', '#4ade80', '#f43f5e', '#ffffff'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      color === c ? 'scale-125 ring-2 ring-white' : 'opacity-80 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearCanvas}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/60 border border-red-800/60 text-red-300 hover:bg-red-900/60 rounded-lg text-sm font-semibold transition"
            >
              <Trash2 size={16} /> Alles löschen
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold transition"
            >
              Fertig
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
