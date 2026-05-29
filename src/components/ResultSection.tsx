import { RefreshCw } from 'lucide-react';
import { ResultCard } from './ResultCard';
import { useApp } from '../context/AppContext';
import { MODEL_OPTIONS } from '../utils/constants';
import { toYYMMDD, removeKeywordsLine } from '../utils/formatters';
import { downloadTxt } from '../utils/download';

interface Props {
  onRetry1: () => void;
  onRetry2: () => void;
  onRetryMerge: () => void;
  onRetryAll: () => void;
  onToast: (msg: string) => void;
}

export function ResultSection({ onRetry1, onRetry2, onRetryMerge, onRetryAll, onToast }: Props) {
  const { state } = useApp();
  const { baseResult1, baseResult2, finalResult, inputDate, settings } = state;

  const model1 = MODEL_OPTIONS.find(m => m.id === settings.baseModel1);
  const model2 = MODEL_OPTIONS.find(m => m.id === settings.baseModel2);
  const mergeModel = MODEL_OPTIONS.find(m => m.id === settings.mergeModel);

  const result1 = { ...baseResult1, modelName: model1?.name ?? settings.baseModel1 };
  const result2 = { ...baseResult2, modelName: model2?.name ?? settings.baseModel2 };
  const mergeResult = finalResult
    ? { ...finalResult, content: removeKeywordsLine(finalResult.content), modelName: mergeModel?.name ?? settings.mergeModel }
    : { modelId: settings.mergeModel, modelName: mergeModel?.name ?? settings.mergeModel, content: '', latencyMs: 0, status: 'idle' as const };

  const yymmdd = toYYMMDD(inputDate);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      onToast('클립보드에 복사되었습니다');
    } catch {
      onToast('복사에 실패했습니다');
    }
  };

  const downloadModel = (content: string, alias: string) => {
    downloadTxt(content, `${yymmdd}_${alias}.txt`);
    onToast('파일이 다운로드되었습니다');
  };

  const downloadFinal = () => {
    if (!finalResult) return;
    const clean = removeKeywordsLine(finalResult.content);
    const [k1, k2] = finalResult.keywords;
    downloadTxt(clean, `${yymmdd}_${k1}_${k2}.txt`);
    onToast('파일이 다운로드되었습니다');
  };

  const hasAnyResult =
    baseResult1.status !== 'idle' ||
    baseResult2.status !== 'idle' ||
    (finalResult !== null);

  if (!hasAnyResult) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300">정리 결과</h2>
        <button
          onClick={onRetryAll}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <RefreshCw size={14} />
          전체 다시 생성
        </button>
      </div>

      {/* 3-card grid: desktop 2+1 layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="fade-in fade-in-1">
          <ResultCard
            result={result1}
            label="모델 A"
            onRetry={onRetry1}
            onCopy={result1.status === 'success' ? () => copyToClipboard(result1.content) : undefined}
            onDownload={result1.status === 'success' ? () => downloadModel(result1.content, model1?.name?.replace(/\s+/g, '') ?? 'ModelA') : undefined}
          />
        </div>
        <div className="fade-in fade-in-2">
          <ResultCard
            result={result2}
            label="모델 B"
            onRetry={onRetry2}
            onCopy={result2.status === 'success' ? () => copyToClipboard(result2.content) : undefined}
            onDownload={result2.status === 'success' ? () => downloadModel(result2.content, model2?.name?.replace(/\s+/g, '') ?? 'ModelB') : undefined}
          />
        </div>
        <div className="md:col-span-2 fade-in fade-in-3">
          <ResultCard
            result={mergeResult}
            label="통합 결과"
            isMerge
            onRetry={mergeResult.status === 'error' ? onRetryMerge : undefined}
            onCopy={mergeResult.status === 'success' ? () => copyToClipboard(mergeResult.content) : undefined}
            onDownload={mergeResult.status === 'success' ? downloadFinal : undefined}
          />
        </div>
      </div>
    </section>
  );
}
