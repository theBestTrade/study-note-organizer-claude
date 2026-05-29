import { Copy, Download, RefreshCw, Clock, Hash, Merge } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorDisplay } from './ErrorDisplay';
import type { ModelResult } from '../types';
import { PROVIDER_COLORS, MODEL_OPTIONS } from '../utils/constants';
import { clsx } from 'clsx';

interface Props {
  result: ModelResult;
  label: string;
  isMerge?: boolean;
  animClass?: string;
  onRetry?: () => void;
  onCopy?: () => void;
  onDownload?: () => void;
}

function getProviderColor(modelId: string): string {
  const model = MODEL_OPTIONS.find(m => m.id === modelId);
  const provider = model?.provider ?? '';
  return PROVIDER_COLORS[provider] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
}

export function ResultCard({ result, label, isMerge, animClass, onRetry, onCopy, onDownload }: Props) {
  const { status, modelId, modelName, content, latencyMs, tokenUsage, errorMessage } = result;
  const providerColor = getProviderColor(modelId);

  return (
    <div className={clsx(
      'flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm h-full',
      animClass
    )}>
      {/* Card Header */}
      <div className={clsx(
        'flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700',
        isMerge ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-gray-750'
      )}>
        <div className="flex items-center gap-2 min-w-0">
          {isMerge && <Merge size={15} className="text-blue-600 dark:text-blue-400 shrink-0" />}
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
            {label}
          </span>
          {modelName && (
            <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium shrink-0', providerColor)}>
              {modelName}
            </span>
          )}
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Meta row */}
      {status === 'success' && (
        <div className="flex items-center gap-3 px-4 py-2 text-xs text-gray-400 dark:text-gray-500 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {(latencyMs / 1000).toFixed(1)}s
          </span>
          {tokenUsage && (
            <span className="flex items-center gap-1">
              <Hash size={11} />
              {tokenUsage.total.toLocaleString()} tokens
            </span>
          )}
          <div className="flex-1" />
          {onCopy && (
            <ActionBtn icon={<Copy size={13} />} label="복사" onClick={onCopy} />
          )}
          {onDownload && (
            <ActionBtn icon={<Download size={13} />} label="다운로드" onClick={onDownload} />
          )}
          {onRetry && (
            <ActionBtn icon={<RefreshCw size={13} />} label="다시 요청" onClick={onRetry} />
          )}
        </div>
      )}

      {/* Body */}
      <div className="flex-1 p-4 overflow-auto">
        {status === 'idle' && (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
            정리하기를 눌러 결과를 확인하세요
          </p>
        )}
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <LoadingSpinner size={28} />
            <p className="text-sm text-gray-400 dark:text-gray-500">생성 중...</p>
          </div>
        )}
        {status === 'error' && (
          <ErrorDisplay message={errorMessage ?? '오류가 발생했습니다.'} onRetry={onRetry} />
        )}
        {status === 'success' && (
          <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed font-sans">
            {content}
          </pre>
        )}
      </div>

      {/* Error action row */}
      {status === 'error' && onRetry && (
        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700" />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: ModelResult['status'] }) {
  if (status === 'idle') return null;
  const map = {
    loading: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  const labels = { loading: '생성 중', success: '완료', error: '오류' };
  return (
    <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', map[status])}>
      {labels[status]}
    </span>
  );
}

function ActionBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
