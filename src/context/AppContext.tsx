import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { AppState, AppAction, ModelResult, HistoryItem } from '../types';
import { DEFAULT_SETTINGS, MAX_HISTORY } from '../utils/constants';
import { LS_KEYS } from '../utils/constants';
import { readLocalStorage, writeLocalStorage } from '../hooks/useLocalStorage';
import { getTodayString } from '../utils/formatters';
import { getSystemTheme } from '../hooks/useTheme';

const idleResult = (modelId = '', modelName = ''): ModelResult => ({
  modelId, modelName, content: '', latencyMs: 0, status: 'idle',
});

function loadInitialState(): AppState {
  const rawSettings = readLocalStorage(LS_KEYS.SETTINGS, { ...DEFAULT_SETTINGS });
  // Explicitly whitelist persisted settings to erase legacy browser API keys.
  const savedSettings = {
    baseModel1: rawSettings.baseModel1 || DEFAULT_SETTINGS.baseModel1,
    baseModel2: rawSettings.baseModel2 || DEFAULT_SETTINGS.baseModel2,
    mergeModel: rawSettings.mergeModel || DEFAULT_SETTINGS.mergeModel,
    theme: rawSettings.theme === 'dark' ? 'dark' as const : 'light' as const,
  };
  const savedHistory = readLocalStorage<HistoryItem[]>(LS_KEYS.HISTORY, []);
  const savedDraft = readLocalStorage<{ inputDate: string; inputText: string }>(
    LS_KEYS.DRAFT, { inputDate: getTodayString(), inputText: '' }
  );
  const theme = savedSettings.theme ?? getSystemTheme();

  return {
    inputDate: savedDraft.inputDate || getTodayString(),
    inputText: savedDraft.inputText || '',
    settings: { ...DEFAULT_SETTINGS, ...savedSettings, theme },
    baseResult1: idleResult(savedSettings.baseModel1, ''),
    baseResult2: idleResult(savedSettings.baseModel2, ''),
    finalResult: null,
    history: savedHistory,
    isSettingsOpen: false,
    isHistoryOpen: false,
  };
}

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_INPUT_DATE':
      return { ...state, inputDate: action.payload };
    case 'SET_INPUT_TEXT':
      return { ...state, inputText: action.payload };
    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'SET_BASE_RESULT_1':
      return { ...state, baseResult1: { ...state.baseResult1, ...action.payload } };
    case 'SET_BASE_RESULT_2':
      return { ...state, baseResult2: { ...state.baseResult2, ...action.payload } };
    case 'SET_FINAL_RESULT':
      return { ...state, finalResult: action.payload };
    case 'ADD_HISTORY': {
      const updated = [action.payload, ...state.history].slice(0, MAX_HISTORY);
      return { ...state, history: updated };
    }
    case 'DELETE_HISTORY':
      return { ...state, history: state.history.filter(h => h.id !== action.payload) };
    case 'CLEAR_HISTORY':
      return { ...state, history: [] };
    case 'RESTORE_HISTORY': {
      const item = action.payload;
      return {
        ...state,
        inputDate: item.date,
        inputText: item.inputText,
        baseResult1: item.baseResult1,
        baseResult2: item.baseResult2,
        finalResult: item.finalResult,
        isHistoryOpen: false,
      };
    }
    case 'TOGGLE_SETTINGS':
      return { ...state, isSettingsOpen: !state.isSettingsOpen, isHistoryOpen: false };
    case 'TOGGLE_HISTORY':
      return { ...state, isHistoryOpen: !state.isHistoryOpen, isSettingsOpen: false };
    case 'CLOSE_PANELS':
      return { ...state, isSettingsOpen: false, isHistoryOpen: false };
    case 'RESET_RESULTS':
      return {
        ...state,
        baseResult1: idleResult(state.settings.baseModel1, ''),
        baseResult2: idleResult(state.settings.baseModel2, ''),
        finalResult: null,
      };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitialState);

  useEffect(() => {
    writeLocalStorage(LS_KEYS.SETTINGS, state.settings);
  }, [state.settings]);

  useEffect(() => {
    writeLocalStorage(LS_KEYS.HISTORY, state.history);
  }, [state.history]);

  useEffect(() => {
    writeLocalStorage(LS_KEYS.DRAFT, { inputDate: state.inputDate, inputText: state.inputText });
  }, [state.inputDate, state.inputText]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function useToast() {
  const [toasts, setToasts] = React.useState<Array<{ id: number; message: string }>>([]);

  const addToast = useCallback((message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  return { toasts, addToast };
}
