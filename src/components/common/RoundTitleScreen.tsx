import React from 'react';
import { motion } from 'motion/react';
import { RoundLogoRenderer } from './RoundLogoAssets.js';
import { GameRound } from '../../types.js';

interface RoundTitleScreenProps {
  title: string;
  logoUrl?: string | null;
  id?: string;
  roundKey?: GameRound | string;
}

type RoundTheme = 'green' | 'amber' | 'purple' | 'red' | 'blue' | 'white';

function resolveRoundTheme(roundKey?: string, title?: string): RoundTheme {
  if (roundKey) {
    switch (roundKey) {
      case 'KHOI_DONG':
        return 'green';
      case 'VCNV':
        return 'amber';
      case 'TANG_TOC':
        return 'purple';
      case 'VE_DICH':
        return 'red';
      case 'WAITING':
      case 'SUMMARY':
        return 'white';
      case 'CH_PHU':
      case 'JEOPARDY':
      case 'MA_TRAN_KEP':
      case 'CHINH_PHUC':
      case 'DAU_TRI':
      default:
        return 'blue';
    }
  }

  // Fallback if roundKey is not supplied: inspect title
  const upper = (title || '').toUpperCase();
  if (upper.includes('KHỞI ĐỘNG')) return 'green';
  if (upper.includes('CHƯỚNG NGẠI VẬT') || upper.includes('VCNV')) return 'amber';
  if (upper.includes('TĂNG TỐC')) return 'purple';
  if (upper.includes('VỀ ĐÍCH')) return 'red';
  if (upper.includes('TỔNG KẾT') || upper.includes('OLYMPIA')) return 'white';
  return 'blue';
}

const THEME_STYLES: Record<
  RoundTheme,
  {
    textColor: string;
    textShadow: string;
    logoBorder: string;
  }
> = {
  green: {
    textColor: 'text-emerald-400',
    textShadow: '0 0 10px rgba(52, 211, 153, 0.65), 0 0 22px rgba(16, 185, 129, 0.35)',
    logoBorder: 'border-emerald-500/40',
  },
  amber: {
    textColor: 'text-amber-400',
    textShadow: '0 0 10px rgba(251, 191, 36, 0.65), 0 0 22px rgba(245, 158, 11, 0.35)',
    logoBorder: 'border-amber-500/40',
  },
  purple: {
    textColor: 'text-purple-400',
    textShadow: '0 0 10px rgba(192, 132, 252, 0.65), 0 0 22px rgba(168, 85, 247, 0.35)',
    logoBorder: 'border-purple-500/40',
  },
  red: {
    textColor: 'text-red-500',
    textShadow: '0 0 10px rgba(248, 113, 113, 0.65), 0 0 22px rgba(239, 68, 68, 0.35)',
    logoBorder: 'border-red-500/40',
  },
  blue: {
    textColor: 'text-sky-400',
    textShadow: '0 0 10px rgba(56, 189, 248, 0.65), 0 0 22px rgba(14, 165, 233, 0.35)',
    logoBorder: 'border-sky-500/40',
  },
  white: {
    textColor: 'text-slate-100',
    textShadow: '0 0 8px rgba(255, 255, 255, 0.35), 0 0 16px rgba(226, 232, 240, 0.2)',
    logoBorder: 'border-slate-400/40',
  },
};

export default function RoundTitleScreen({
  title,
  logoUrl,
  id,
  roundKey,
}: RoundTitleScreenProps) {
  const hasLogo = Boolean(logoUrl && logoUrl !== 'none');
  const themeKey = resolveRoundTheme(roundKey, title);
  const theme = THEME_STYLES[themeKey];

  const normalizedTitle = title.trim().replace(/\s+/g, ' ').toUpperCase();
  const isDefaultVCNV =
    (roundKey === 'VCNV' || !roundKey) &&
    normalizedTitle === 'VƯỢT CHƯỚNG NGẠI VẬT';

  return (
    <div
      id={id || 'round-title-screen'}
      className="relative w-full h-full min-h-[460px] flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden my-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center justify-center space-y-6 z-10 max-w-5xl px-4"
      >
        {/* Optional Logo */}
        {hasLogo && (
          <div className="relative">
            <div
              className={`w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-3xl bg-slate-900/90 border-2 ${theme.logoBorder} flex items-center justify-center p-4 backdrop-blur-md transition-all duration-300 shadow-lg`}
            >
              <RoundLogoRenderer
                logoIdOrUrl={logoUrl!}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}

        {/* Round Title with distinct color, glow effects, and two-line centering for default VCNV */}
        {isDefaultVCNV ? (
          <h1
            className={`font-round-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-wider ${theme.textColor} select-none text-center`}
            style={{ textShadow: theme.textShadow }}
          >
            <div className="flex flex-col items-center justify-center space-y-1 sm:space-y-2">
              <span className="block leading-none">VƯỢT</span>
              <span className="block leading-none">CHƯỚNG NGẠI VẬT</span>
            </div>
          </h1>
        ) : (
          <h1
            className={`font-round-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black uppercase tracking-wider ${theme.textColor} select-none text-center`}
            style={{ textShadow: theme.textShadow }}
          >
            <span className="block leading-tight">{title}</span>
          </h1>
        )}
      </motion.div>
    </div>
  );
}
