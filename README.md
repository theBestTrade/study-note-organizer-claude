# Study Note Organizer — Claude 버전

수업 및 회의 원문을 붙여넣으면 **두 OpenRouter 모델이 병렬로 요약**하고, **통합 모델이 원문과 두 요약을 함께 검증**하여 최종 학습 일지를 작성하는 React + TypeScript 앱입니다.

## 기능
- 날짜 및 텍스트 입력, 기본 모델 2개 병렬 실행, 통합 모델 1개
- 원문 대조 기반 통합, 결과 카드·재요청·토큰 사용량·TXT 다운로드
- 브라우저에 최대 50건 히스토리 저장, 다크/라이트 모드
- 모델 선택 가능. 실제 OpenRouter 모델 ID 지원 여부는 개별 확인 필요

## 기술 스택
React, Vite, TypeScript, Tailwind CSS, Node.js 내장 HTTP 서버, OpenRouter.

## 로컬 설치 및 실행
Node.js 22.12+ 권장.

```bash
npm ci
```

`.env.example`을 `.env`로 복사한 뒤 **실제 OpenRouter 키**를 설정합니다.

```powershell
Copy-Item .env.example .env
```

```dotenv
OPENROUTER_API_KEY=sk-or-v1-...
API_PORT=8787
HOST=127.0.0.1
```

```bash
npm run dev
```

Vite의 출력 주소(보통 `http://localhost:5173`)로 접속합니다. `/api/chat` 요청은 로컬 Node API 서버(8787)로 프록시됩니다. **VITE_OPENROUTER_API_KEY 등 VITE_ 접두사로 비밀 키를 저장하지 마세요.**

## 프로덕션 방식 (Node 서버 필요)
```bash
npm run build
npm run start
```
빌드된 웹 UI와 API가 `http://127.0.0.1:8787`에서 함께 제공됩니다. 단순 정적 호스팅만으로는 AI 호출이 동작하지 않습니다.

## AI 아키텍처
```text
React → POST /api/chat → Node 서버 (OPENROUTER_API_KEY) → OpenRouter
원문 → [모델 A || 모델 B] → 통합 모델 (원문 + 두 초안) → 최종 TXT
```

통합 모델은 **원문을 사실 확인 기준**으로 사용하여 두 모델의 공통 누락·환각 가능성을 줄입니다. 모델 결과의 사실 정확성이 자동 보증되는 것은 아닙니다.

## 보안 및 저장소 관리
- API Key 입력 UI와 클라이언트 OpenRouter 직접 호출을 삭제했습니다. 키는 서버 환경변수에서만 읽습니다.
- 이전 버전에서 브라우저에 저장된 `apiKey` 속성은 설정을 다시 저장할 때 제거됩니다. 공용 PC라면 브라우저 사이트 데이터를 별도 삭제하세요.
- `.env`, `node_modules`, `dist`를 Git 추적에서 제외합니다. 두 빌드 폴더는 이전부터 추적되지 않았습니다.
- **로컬 개인용 실행을 전제로 합니다. 공개 서버에 노출하기 전에 인증, 요청 제한, 사용량·비용 상한, 접근 통제를 반드시 추가하세요.** 키를 서버에 숨기는 것만으로 악의적 AI 요청을 막을 수 없습니다.
- 수업 원문·결과·히스토리는 브라우저 localStorage에 남을 수 있으므로 개인정보나 회사 기밀 입력에 주의하세요.

## 주요 코드
| 경로 | 기능 |
|---|---|
| `server/index.mjs` | 서버 측 OpenRouter API 프록시 |
| `scripts/dev.mjs` | API 서버 및 Vite 동시 개발 실행 |
| `src/hooks/useOpenRouter.ts` | 브라우저 내부 API 요청 |
| `src/utils/prompts.ts` | 원문 검증 통합 프롬프트 |
| `src/App.tsx` | 병렬 처리 및 AI 통합 |
| `src/components/SettingsPanel.tsx` | 모델 선택 (API 키 입력 삭제) |

## 개선 이력 및 잔여 위험
- **매우 높음 → 낮음(로컬)**: 브라우저 API Key 노출 위험 축소
- **높음 → 중간**: 원문 없는 통합으로 인한 내용 누락 위험 완화 (AI 오류 가능성 잔존)
- **Git 추적 위험은 기존부터 낮음**: `node_modules`, `dist` 미추적, `.env` 제외 보강
- **공개 배포 위험은 여전히 높음**: 인증·과금 제한·레이트 리미팅 미구현
