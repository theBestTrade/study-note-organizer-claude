import type { ModelOption, AppSettings } from '../types';

export const MODEL_OPTIONS: ModelOption[] = [
  { id: "deepseek/deepseek-v4-flash", name: "DeepSeek V4 Flash", provider: "DeepSeek", isFree: false },
  { id: "tencent/hy3-preview", name: "Tencent Hy3", provider: "Tencent", isFree: false },
  { id: "anthropic/claude-opus-4-7", name: "Claude Opus 4.7", provider: "Anthropic", isFree: false },
  { id: "anthropic/claude-sonnet-4-6", name: "Claude Sonnet 4.6", provider: "Anthropic", isFree: false },
  { id: "google/gemini-3-flash-preview", name: "Gemini 3 Flash", provider: "Google", isFree: false },
  { id: "moonshotai/kimi-k2-6", name: "Kimi K2.6", provider: "Moonshot", isFree: false },
  { id: "qwen/qwen3-6-plus", name: "Qwen 3.6 Plus", provider: "Qwen", isFree: false },
  { id: "qwen/qwen3-5-flash", name: "Qwen 3.5 Flash", provider: "Qwen", isFree: false },
  { id: "openai/gpt-5-5", name: "GPT-5.5", provider: "OpenAI", isFree: false },
  { id: "openai/gpt-5-mini", name: "GPT-5 Mini", provider: "OpenAI", isFree: false },
  { id: "openai/gpt-oss-120b:free", name: "GPT-OSS 120B (Free)", provider: "OpenAI", isFree: true },
  { id: "z-ai/glm-4-5-air:free", name: "GLM 4.5 Air (Free)", provider: "Z-AI", isFree: true },
  { id: "arcee-ai/trinity-large-thinking:free", name: "Trinity Large (Free)", provider: "Arcee", isFree: true },
];

export const DEFAULT_SETTINGS: AppSettings = {
  baseModel1: "anthropic/claude-sonnet-4-6",
  baseModel2: "google/gemini-3-flash-preview",
  mergeModel: "anthropic/claude-opus-4-7",
  theme: "light",
};

export const PROVIDER_COLORS: Record<string, string> = {
  Anthropic: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  Google: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  OpenAI: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  DeepSeek: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  Tencent: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  Moonshot: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  Qwen: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Arcee: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  "Z-AI": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
};

export const LS_KEYS = {
  SETTINGS: 'study-note-organizer-settings',
  HISTORY: 'study-note-organizer-history',
  DRAFT: 'study-note-organizer-draft',
} as const;

export const MAX_HISTORY = 50;
