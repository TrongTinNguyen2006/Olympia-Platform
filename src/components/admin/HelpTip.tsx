import React from 'react';
import { HelpCircle } from 'lucide-react';

interface HelpTipProps {
  content: string | React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function HelpTip({ content }: HelpTipProps) {
  return (
    <span className="relative group inline-flex items-center ml-1.5 z-30 align-middle">
      <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer shrink-0" />
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block w-64 p-2.5 bg-slate-900 border border-slate-700 text-slate-200 text-[11px] leading-snug rounded-xl shadow-2xl z-50 pointer-events-none font-normal normal-case text-left">
        {content}
      </span>
    </span>
  );
}
