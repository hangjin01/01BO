import React from 'react';
import { Icon01BoBrand, IconBell, IconMoon, IconSun } from './Icons';
import { Lang } from '../types';

interface NavbarProps {
  theme: 'light' | 'dark';
  language: Lang;
  toggleLanguage: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setNotification: (notif: { message: string; type: 'success' | 'error' } | null) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  language,
  toggleLanguage,
  setTheme,
  setNotification,
}) => {
  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-700/80 sticky top-0 z-30 px-4 py-3 flex items-center justify-between transition-colors duration-200 shadow-sm">
      <div className="flex items-center gap-3">
        <Icon01BoBrand className="h-7" />
      </div>
      <div className="flex items-center space-x-2">
        <button 
          onClick={() => setNotification({ 
            message: language === 'ko' ? '새로운 출장 알림이 없습니다.' : '新しい出張通知はありません。', 
            type: 'success' 
          })}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-700/70 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors relative"
          title="Notifications"
        >
          <IconBell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
        </button>
        
        <button 
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-700/70 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          title="Toggle Theme"
        >
          {theme === 'light' ? <IconMoon className="w-4 h-4 text-slate-700" /> : <IconSun className="w-4 h-4 text-amber-400" />}
        </button>

        <button 
          onClick={toggleLanguage}
          className="px-2.5 py-1.5 rounded-full bg-slate-900 text-white dark:bg-slate-700 text-[11px] font-bold tracking-tight hover:bg-slate-800 transition-colors"
        >
          {language === 'ja' ? '🇯🇵 JP' : '🇰🇷 KR'}
        </button>
      </div>
    </div>
  );
};
