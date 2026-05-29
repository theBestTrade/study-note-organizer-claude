import { Sun, Moon, Settings, History, BookOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../hooks/useTheme';

export function Header() {
  const { state, dispatch } = useApp();
  const { settings } = state;

  useTheme(settings.theme);

  const toggleTheme = () => {
    dispatch({ type: 'SET_SETTINGS', payload: { theme: settings.theme === 'dark' ? 'light' : 'dark' } });
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen size={22} className="text-blue-600 dark:text-blue-400" />
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            학습 일지 정리기
          </h1>
        </div>

        <div className="flex items-center gap-1">
          <IconBtn onClick={toggleTheme} label={settings.theme === 'dark' ? '라이트 모드' : '다크 모드'}>
            {settings.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </IconBtn>

          <IconBtn onClick={() => dispatch({ type: 'TOGGLE_HISTORY' })} label="히스토리">
            <History size={18} />
          </IconBtn>

          <IconBtn onClick={() => dispatch({ type: 'TOGGLE_SETTINGS' })} label="설정">
            <Settings size={18} />
          </IconBtn>
        </div>
      </div>
    </header>
  );
}

function IconBtn({ children, onClick, label }: { children: React.ReactNode; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      {children}
    </button>
  );
}
