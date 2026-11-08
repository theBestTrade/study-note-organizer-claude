export interface CallResult {
  content: string;
  latencyMs: number;
  tokenUsage?: { prompt: number; completion: number; total: number };
}

interface OpenRouterResponse {
  choices?: Array<{ message?: { content?: string } }>;
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
  error?: { message?: string };
}

export async function callOpenRouter(modelId: string, prompt: string): Promise<CallResult> {
  const start = Date.now();
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: modelId, prompt }),
  });
  const data = await response.json().catch(() => ({})) as OpenRouterResponse;
  if (!response.ok) throw new Error(data.error?.message || `AI API 요청 실패 (${response.status})`);
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('모델 응답이 비어 있습니다.');
  return {
    content,
    latencyMs: Date.now() - start,
    tokenUsage: data.usage ? {
      prompt: data.usage.prompt_tokens ?? 0,
      completion: data.usage.completion_tokens ?? 0,
      total: data.usage.total_tokens ?? 0,
    } : undefined,
  };
}
