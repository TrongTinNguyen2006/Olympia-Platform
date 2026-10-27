import React from 'react';
import { SocketEvent } from '../../types.js';
import { Square } from 'lucide-react';

export interface SoundItem {
  id: string;
  label: string;
}

interface RoundSoundPanelProps {
  title: string;
  sounds: SoundItem[];
  adminCommand: (event: string, data?: any) => void;
  accentColor?: 'teal' | 'amber' | 'indigo' | 'purple' | 'cyan' | 'rose' | 'emerald';
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}

export default function RoundSoundPanel({
  title,
  sounds,
  adminCommand,
  accentColor = 'teal',
  columns = 2,
  className = '',
}: RoundSoundPanelProps) {
  // Border and hover styles based on accentColor
  const getThemeClasses = () => {
    switch (accentColor) {
      case 'amber':
        return {
          titleColor: 'text-amber-300',
          btnHover: 'hover:bg-amber-950/40 hover:border-amber-500/40 group-hover:text-amber-300',
        };
      case 'indigo':
        return {
          titleColor: 'text-indigo-300',
          btnHover: 'hover:bg-indigo-950/40 hover:border-indigo-500/40 group-hover:text-indigo-300',
        };
      case 'purple':
        return {
          titleColor: 'text-purple-300',
          btnHover: 'hover:bg-purple-950/40 hover:border-purple-500/40 group-hover:text-purple-300',
        };
      case 'cyan':
        return {
          titleColor: 'text-cyan-300',
          btnHover: 'hover:bg-cyan-950/40 hover:border-cyan-500/40 group-hover:text-cyan-300',
        };
      case 'rose':
        return {
          titleColor: 'text-rose-300',
          btnHover: 'hover:bg-rose-950/40 hover:border-rose-500/40 group-hover:text-rose-300',
        };
      case 'emerald':
        return {
          titleColor: 'text-emerald-300',
          btnHover: 'hover:bg-emerald-950/40 hover:border-emerald-500/40 group-hover:text-emerald-300',
        };
      case 'teal':
      default:
        return {
          titleColor: 'text-teal-300',
          btnHover: 'hover:bg-teal-950/40 hover:border-teal-500/40 group-hover:text-teal-300',
        };
    }
  };

  const theme = getThemeClasses();

  const getColClass = () => {
    if (columns === 3) return 'grid-cols-2 sm:grid-cols-3';
    if (columns === 4) return 'grid-cols-2 sm:grid-cols-4';
    if (columns === 5) return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5';
    return 'grid-cols-2';
  };

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-xl p-2.5 space-y-2 shadow-md ${className}`}>
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
        <h3 className={`text-[11px] font-bold uppercase tracking-wider ${theme.titleColor}`}>
          {title}
        </h3>
        <button
          type="button"
          onClick={() => adminCommand(SocketEvent.ADMIN_STOP_ALL_SOUNDS)}
          className="px-2 py-0.5 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-[9px] font-bold rounded transition-all flex items-center gap-1 cursor-pointer shrink-0 active:scale-95"
          title="Dừng tất cả âm thanh đang phát"
        >
          <Square className="w-2.5 h-2.5 fill-current text-rose-400" />
          <span>Dừng Âm</span>
        </button>
      </div>

      {/* SOUND BUTTONS GRID: Center-aligned text, no icons, no triangle play buttons */}
      <div className={`grid ${getColClass()} gap-1.5`}>
        {sounds.map((sound) => (
          <button
            key={sound.id}
            type="button"
            onClick={() => adminCommand(SocketEvent.ADMIN_PLAY_SOUND, { soundId: sound.id })}
            className={`p-2 bg-slate-950 border border-slate-800 rounded-lg transition-all cursor-pointer flex items-center justify-center text-center min-h-[44px] group active:scale-[0.98] ${theme.btnHover}`}
            title={`Phát âm thanh: ${sound.label}`}
          >
            <span className="text-[11px] font-semibold text-slate-300 text-center leading-snug break-words group-hover:text-white transition-colors">
              {sound.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
