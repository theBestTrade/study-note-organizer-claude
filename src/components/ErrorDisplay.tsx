import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  message: string;
  onRetry?: () => void;
}

export function ErrorDisplay({ message, onRetry }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 py-6 text-center">
      <AlertCircle className="text-red-500" size={32} />
      <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors"
        >
          <RefreshCw size={14} />
          재시도
        </button>
      )}
    </div>
  );
}
