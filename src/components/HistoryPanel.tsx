import { X, Trash2, Clock, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { HistoryItem } from '../types';
import { MODEL_OPTIONS } from '../utils/constants';

export function HistoryPanel() {
  const { state, dispatch } = useApp();
  const { history, isHistoryOpen } = state;

  if (!isHistoryOpen) return null;

  const restore = (item: HistoryItem) => {
    dispatch({ type: 'RESTORE_HISTORY', payload: item });
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <aside className="w-full max-w-sm bg-white dark:bg-gray-900 h-full shadow-xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            히스토리 ({history.length})
          </h2>
          <div className="flex items-center gap-1">
            {history.length > 0 && (
              <button
                onClick={() => dispatch({ type: 'CLEAR_HISTORY' })}
                className="p-1.5 rounded text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-xs flex items-center gap-1"
                title="전체 삭제"
              >
                <Trash2 size={14} />
                <span className="hidden sm:inline">전체 삭제</span>
              </button>
            )}
            <button onClick={() => dispatch({ type: 'CLOSE_PANELS' })} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ml-1">
              <X size={18} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 gap-2">
              <Clock size={32} />
              <p className="text-sm">히스토리가 없습니다</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {history.map(item => (
                <HistoryEntry
                  key={item.id}
                  item={item}
                  onRestore={() => restore(item)}
                  onDelete={() => dispatch({ type: 'DELETE_HISTORY', payload: item.id })}
                />
              ))}
            </ul>
          )}
        </div>
      </aside>
      <div className="flex-1 bg-black/30" onClick={() => dispatch({ type: 'CLOSE_PANELS' })} />
    </div>
  );
}

function HistoryEntry({
  item, onRestore, onDelete,
}: { item: HistoryItem; onRestore: () => void; onDelete: () => void }) {
  const model1Name = MODEL_OPTIONS.find(m => m.id === item.baseResult1.modelId)?.name ?? item.baseResult1.modelId;
  const model2Name = MODEL_OPTIONS.find(m => m.id === item.baseResult2.modelId)?.name ?? item.baseResult2.modelId;
  const ts = new Date(item.timestamp);
  const timeStr = ts.toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <li className="group flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/60 cursor-pointer transition-colors" onClick={onRestore}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.formattedDate}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">{timeStr}</span>
        </div>
        {item.finalResult.keywords && (
          <div className="flex gap-1 mb-1">
            {item.finalResult.keywords.map((kw, i) => (
              <span key={i} className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-1.5 py-0.5 rounded">
                {kw}
              </span>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
          {model1Name} · {model2Name}
        </p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={e => { e.stopPropagation(); onDelete(); }}
          className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-red-400"
          title="삭제"
        >
          <Trash2 size={14} />
        </button>
        <ChevronRight size={14} className="text-gray-300 dark:text-gray-600" />
      </div>
    </li>
  );
}
