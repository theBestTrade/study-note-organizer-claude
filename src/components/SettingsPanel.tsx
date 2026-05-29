import { useState } from 'react';
import { X, Eye, EyeOff, AlertTriangle, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MODEL_OPTIONS } from '../utils/constants';
import { clsx } from 'clsx';

interface Props {
  onToast: (msg: string) => void;
}

export function SettingsPanel({ onToast }: Props) {
  const { state, dispatch } = useApp();
  const { settings, isSettingsOpen } = state;

  const [local, setLocal] = useState({ ...settings });
  const [showKey, setShowKey] = useState(false);

  const handleSave = () => {
    dispatch({ type: 'SET_SETTINGS', payload: local });
    dispatch({ type: 'CLOSE_PANELS' });
    onToast('설정이 저장되었습니다');
  };

  const handleOpen = () => {
    setLocal({ ...settings });
  };

  if (!isSettingsOpen) return null;

  const providers = [...new Set(MODEL_OPTIONS.map(m => m.provider))];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30" onClick={() => dispatch({ type: 'CLOSE_PANELS' })} />
      <aside
        className="w-full max-w-sm bg-white dark:bg-gray-900 h-full shadow-xl flex flex-col overflow-hidden"
        onAnimationStart={handleOpen}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">설정</h2>
          <button onClick={() => dispatch({ type: 'CLOSE_PANELS' })} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* API Key */}
          <FieldGroup label="OpenRouter API Key">
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={local.apiKey}
                onChange={e => setLocal(p => ({ ...p, apiKey: e.target.value }))}
                placeholder="sk-or-..."
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => setShowKey(v => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">openrouter.ai에서 발급받은 API Key를 입력하세요.</p>
          </FieldGroup>

          {/* Base Model 1 */}
          <FieldGroup label="기본 모델 A">
            <ModelSelect
              value={local.baseModel1}
              onChange={v => setLocal(p => ({ ...p, baseModel1: v }))}
              providers={providers}
            />
          </FieldGroup>

          {/* Base Model 2 */}
          <FieldGroup label="기본 모델 B">
            <ModelSelect
              value={local.baseModel2}
              onChange={v => setLocal(p => ({ ...p, baseModel2: v }))}
              providers={providers}
            />
          </FieldGroup>

          {/* Merge Model */}
          <FieldGroup label="통합 모델">
            <ModelSelect
              value={local.mergeModel}
              onChange={v => setLocal(p => ({ ...p, mergeModel: v }))}
              providers={providers}
            />
          </FieldGroup>
        </div>

        <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <Save size={16} />
            저장
          </button>
        </div>
      </aside>
    </div>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      {children}
    </div>
  );
}

function ModelSelect({ value, onChange, providers }: { value: string; onChange: (v: string) => void; providers: string[] }) {
  const selected = MODEL_OPTIONS.find(m => m.id === value);
  return (
    <div className="space-y-1">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={inputCls}
      >
        {providers.map(provider => (
          <optgroup key={provider} label={provider}>
            {MODEL_OPTIONS.filter(m => m.provider === provider).map(m => (
              <option key={m.id} value={m.id}>
                {m.name}{m.isFree ? ' ★ 무료' : ''}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      {selected?.isFree && (
        <div className="flex items-start gap-1.5 text-xs text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 rounded px-2 py-1.5">
          <AlertTriangle size={12} className="mt-0.5 shrink-0" />
          <span>무료 모델은 응답 속도가 느리거나 품질이 낮을 수 있습니다.</span>
        </div>
      )}
    </div>
  );
}

const inputCls = clsx(
  'w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600',
  'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
  'focus:outline-none focus:ring-2 focus:ring-blue-500'
);
