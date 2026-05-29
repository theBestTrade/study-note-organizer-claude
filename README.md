# 학습 일지 정리기

하루치 수업/회의 내용을 붙여넣으면, 선택한 2개 모델이 각각 학습 일지를 정리하고, 3번째(통합) 모델이 두 결과의 장점만 모아 최종본을 만들어주는 OpenRouter 기반 웹 툴입니다.

## 설치 및 실행

```bash
npm install
npm run dev
```

## 빌드

```bash
npm run build
```

## OpenRouter API Key 발급 및 입력

1. [openrouter.ai](https://openrouter.ai) 접속 후 회원가입
2. 우상단 계정 → **Keys** → **Create Key**
3. 발급된 키(`sk-or-...`)를 앱 우상단 **설정(톱니바퀴)** 에 입력 후 저장

## 보안 주의사항

- API Key는 브라우저 localStorage에만 저장됩니다.
- 공용 PC에서는 사용 후 설정에서 API Key를 삭제하세요.
- API Key를 소스코드나 공개 저장소에 절대 커밋하지 마세요.
