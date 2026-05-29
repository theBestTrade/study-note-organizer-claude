import { useRef, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MODEL_OPTIONS } from '../utils/constants';

interface Props {
  onSubmit: () => void;
  isLoading: boolean;
}

export function InputSection({ onSubmit, isLoading }: Props) {
  const { state, dispatch } = useApp();
  const { inputDate, inputText, settings } = state;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hasFreeModel =
    MODEL_OPTIONS.find(m => m.id === settings.baseModel1)?.isFree ||
    MODEL_OPTIONS.find(m => m.id === settings.baseModel2)?.isFree ||
    MODEL_OPTIONS.find(m => m.id === settings.mergeModel)?.isFree;

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.max(160, ta.scrollHeight)}px`;
  }, [inputText]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      if (!isLoading && inputText.trim()) onSubmit();
    }
  };

  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
      {hasFreeModel && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-300 rounded-lg px-4 py-2.5 text-sm">
          무료 모델은 품질이 낮거나 응답이 느릴 수 있습니다.
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
          날짜 선택
        </label>
        <input
          type="date"
          value={inputDate}
          onChange={e => dispatch({ type: 'SET_INPUT_DATE', payload: e.target.value })}
          className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="relative">
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={e => dispatch({ type: 'SET_INPUT_TEXT', payload: e.target.value })}
          onKeyDown={handleKeyDown}
          placeholder="오늘 수업/회의 내용을 붙여넣으세요"
          className="w-full min-h-[160px] px-4 py-3 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
          maxLength={10000}
        />
        <span className="absolute bottom-2.5 right-3 text-xs text-gray-400 dark:text-gray-500 pointer-events-none">
          {inputText.length.toLocaleString()} / 10,000자
        </span>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Ctrl + Enter 로 바로 정리
        </p>
        <button
          onClick={onSubmit}
          disabled={isLoading || !inputText.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              정리 중...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              정리하기
            </>
          )}
        </button>
      </div>
    </section>
  );
}
