import { OPENROUTER_API_URL } from '../utils/constants';

interface OpenRouterResponse {
  choices: Array<{ message: { content: string } }>;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

function parseErrorMessage(status: number, body: string): string {
  if (status === 401) return 'API Key가 올바르지 않습니다. 설정에서 확인하세요.';
  if (status === 429) return '요청이 너무 많습니다. 잠시 후 다시 시도하세요.';
  if (status === 404 || body.includes('deactivated') || body.includes('not found')) {
    return '선택한 모델을 사용할 수 없습니다. 다른 모델을 선택하세요.';
  }
  return `오류가 발생했습니다. (${status})`;
}

export interface CallResult {
  content: string;
  latencyMs: number;
  tokenUsage?: { prompt: number; completion: number; total: number };
}

export async function callOpenRouter(
  apiKey: string,
  modelId: string,
  prompt: string
): Promise<CallResult> {
  const start = Date.now();

  const res = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    credentials: 'omit',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': '학습 일지 정리기',
    },
    body: JSON.stringify({
      model: modelId,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const latencyMs = Date.now() - start;

  if (!res.ok) {
    let body = '';
    try { body = await res.text(); } catch { /* ignore */ }
    throw new Error(parseErrorMessage(res.status, body));
  }

  const data: OpenRouterResponse = await res.json();
  const content = data.choices?.[0]?.message?.content ?? '';
  const usage = data.usage
    ? { prompt: data.usage.prompt_tokens, completion: data.usage.completion_tokens, total: data.usage.total_tokens }
    : undefined;

  return { content, latencyMs, tokenUsage: usage };
}
