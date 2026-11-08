import { useCallback } from 'react';
import { Header } from './components/Header';
import { InputSection } from './components/InputSection';
import { ResultSection } from './components/ResultSection';
import { SettingsPanel } from './components/SettingsPanel';
import { HistoryPanel } from './components/HistoryPanel';
import { ToastContainer } from './components/Toast';
import { useApp, useToast } from './context/AppContext';
import { callOpenRouter } from './hooks/useOpenRouter';
import { buildBasePrompt, buildMergePrompt } from './utils/prompts';
import { getDateParts, formatDateDisplay, extractKeywords } from './utils/formatters';
import type { ModelResult, FinalResult, HistoryItem } from './types';
import { MODEL_OPTIONS } from './utils/constants';

function App() {
  const { state, dispatch } = useApp();
  const { toasts, addToast } = useToast();
  const { settings, inputDate, inputText } = state;

  const isLoading =
    state.baseResult1.status === 'loading' ||
    state.baseResult2.status === 'loading' ||
    state.finalResult?.status === 'loading';

  const runMerge = useCallback(async (res1: ModelResult, res2: ModelResult) => {
    if (res1.status !== 'success' || res2.status !== 'success') return;

    const mergeModelName = MODEL_OPTIONS.find(m => m.id === settings.mergeModel)?.name ?? settings.mergeModel;
    dispatch({
      type: 'SET_FINAL_RESULT',
      payload: {
        modelId: settings.mergeModel,
        modelName: mergeModelName,
        content: '',
        latencyMs: 0,
        status: 'loading',
        keywords: ['정리', '수업'],
      },
    });

    try {
      const result = await callOpenRouter(settings.mergeModel, buildMergePrompt(inputText, res1.content, res2.content));
      const keywords = extractKeywords(result.content);
      const final: FinalResult = {
        modelId: settings.mergeModel,
        modelName: mergeModelName,
        content: result.content,
        latencyMs: result.latencyMs,
        tokenUsage: result.tokenUsage,
        status: 'success',
        keywords,
      };
      dispatch({ type: 'SET_FINAL_RESULT', payload: final });

      const historyItem: HistoryItem = {
        id: `${Date.now()}-${Math.random()}`,
        date: inputDate,
        formattedDate: formatDateDisplay(inputDate),
        inputText,
        baseResult1: res1,
        baseResult2: res2,
        finalResult: final,
        timestamp: Date.now(),
      };
      dispatch({ type: 'ADD_HISTORY', payload: historyItem });
    } catch (err) {
      dispatch({
        type: 'SET_FINAL_RESULT',
        payload: {
          modelId: settings.mergeModel,
          modelName: mergeModelName,
          content: '',
          latencyMs: 0,
          status: 'error',
          errorMessage: err instanceof Error ? err.message : '통합 중 오류가 발생했습니다.',
          keywords: ['정리', '수업'],
        },
      });
    }
  }, [settings, inputDate, inputText, dispatch]);

  const handleSubmit = useCallback(async () => {
    if (!inputText.trim()) return;

    dispatch({ type: 'RESET_RESULTS' });

    const { month, day, weekday } = getDateParts(inputDate);
    const prompt = buildBasePrompt(inputText, month, day, weekday);
    const model1Name = MODEL_OPTIONS.find(m => m.id === settings.baseModel1)?.name ?? settings.baseModel1;
    const model2Name = MODEL_OPTIONS.find(m => m.id === settings.baseModel2)?.name ?? settings.baseModel2;

    dispatch({ type: 'SET_BASE_RESULT_1', payload: { modelId: settings.baseModel1, modelName: model1Name, status: 'loading', content: '', errorMessage: undefined } });
    dispatch({ type: 'SET_BASE_RESULT_2', payload: { modelId: settings.baseModel2, modelName: model2Name, status: 'loading', content: '', errorMessage: undefined } });

    const [res1, res2] = await Promise.all([
      callOpenRouter(settings.baseModel1, prompt)
        .then(r => ({ modelId: settings.baseModel1, modelName: model1Name, ...r, status: 'success' as const }))
        .catch(err => ({ modelId: settings.baseModel1, modelName: model1Name, content: '', latencyMs: 0, status: 'error' as const, errorMessage: err instanceof Error ? err.message : '오류' })),
      callOpenRouter(settings.baseModel2, prompt)
        .then(r => ({ modelId: settings.baseModel2, modelName: model2Name, ...r, status: 'success' as const }))
        .catch(err => ({ modelId: settings.baseModel2, modelName: model2Name, content: '', latencyMs: 0, status: 'error' as const, errorMessage: err instanceof Error ? err.message : '오류' })),
    ]);

    dispatch({ type: 'SET_BASE_RESULT_1', payload: res1 });
    dispatch({ type: 'SET_BASE_RESULT_2', payload: res2 });

    await runMerge(res1, res2);
  }, [settings, inputDate, inputText, dispatch, addToast, runMerge]);

  const retryModel1 = useCallback(async () => {
    const { month, day, weekday } = getDateParts(inputDate);
    const prompt = buildBasePrompt(inputText, month, day, weekday);
    const model1Name = MODEL_OPTIONS.find(m => m.id === settings.baseModel1)?.name ?? settings.baseModel1;
    dispatch({ type: 'SET_BASE_RESULT_1', payload: { modelId: settings.baseModel1, modelName: model1Name, status: 'loading', content: '', errorMessage: undefined } });
    try {
      const r = await callOpenRouter(settings.baseModel1, prompt);
      const res1: ModelResult = { modelId: settings.baseModel1, modelName: model1Name, ...r, status: 'success' };
      dispatch({ type: 'SET_BASE_RESULT_1', payload: res1 });
      if (state.baseResult2.status === 'success') await runMerge(res1, state.baseResult2);
    } catch (err) {
      dispatch({ type: 'SET_BASE_RESULT_1', payload: { status: 'error', errorMessage: err instanceof Error ? err.message : '오류' } });
    }
  }, [settings, inputDate, inputText, dispatch, addToast, state.baseResult2, runMerge]);

  const retryModel2 = useCallback(async () => {
    const { month, day, weekday } = getDateParts(inputDate);
    const prompt = buildBasePrompt(inputText, month, day, weekday);
    const model2Name = MODEL_OPTIONS.find(m => m.id === settings.baseModel2)?.name ?? settings.baseModel2;
    dispatch({ type: 'SET_BASE_RESULT_2', payload: { modelId: settings.baseModel2, modelName: model2Name, status: 'loading', content: '', errorMessage: undefined } });
    try {
      const r = await callOpenRouter(settings.baseModel2, prompt);
      const res2: ModelResult = { modelId: settings.baseModel2, modelName: model2Name, ...r, status: 'success' };
      dispatch({ type: 'SET_BASE_RESULT_2', payload: res2 });
      if (state.baseResult1.status === 'success') await runMerge(state.baseResult1, res2);
    } catch (err) {
      dispatch({ type: 'SET_BASE_RESULT_2', payload: { status: 'error', errorMessage: err instanceof Error ? err.message : '오류' } });
    }
  }, [settings, inputDate, inputText, dispatch, addToast, state.baseResult1, runMerge]);

  const retryMerge = useCallback(async () => {
    if (state.baseResult1.status === 'success' && state.baseResult2.status === 'success') {
      await runMerge(state.baseResult1, state.baseResult2);
    }
  }, [state.baseResult1, state.baseResult2, runMerge]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <InputSection onSubmit={handleSubmit} isLoading={!!isLoading} />
        <ResultSection
          onRetry1={retryModel1}
          onRetry2={retryModel2}
          onRetryMerge={retryMerge}
          onRetryAll={handleSubmit}
          onToast={addToast}
        />
      </main>
      <SettingsPanel onToast={addToast} />
      <HistoryPanel />
      <ToastContainer toasts={toasts} />
    </div>
  );
}

export default App;
