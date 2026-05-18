# 자소서 거품기 - 기법 라이브러리

평범한 일상 업무 기록을 화려한 이력서 자기소개서 문구로 변환하는 거품 기법 모음입니다.

## 등록된 기법 5종

| # | 기법 | 한 줄 요약 |
|---|---|---|
| 01 | [실수를 성과로](./techniques/01-실수를-성과로/example.md) | 내가 터뜨린 서버도 내가 고치면 성과다 |
| 02 | [범위는 모호하게](./techniques/02-범위는-모호하게/example.md) | '참여하여'로 시작하면 뭐든 내 성과다 |
| 03 | [도구를 숨겨라](./techniques/03-도구를-숨겨라/example.md) | GPT의 도움은 이력서에 존재하지 않는다 |
| 04 | [영어를 섞어라](./techniques/04-영어를-섞어라/example.md) | 같은 말도 영어로 쓰면 연봉이 올라 보인다 |
| 05 | [공백기를 전략으로](./techniques/05-공백기를-전략으로/example.md) | 쉰 게 아니라 투자한 것입니다 |

## 구조

```
이력서 거품기/
├─ README.md
├─ techniques/              # 기법 라이브러리 (단일 진실 공급원)
│  └─ NN-기법명/example.md
└─ skills/                  # techniques를 학습한 실행 스킬
   ├─ resume-bubbler/       # 한국어 → 자소서 (정방향)
   ├─ resume-debubbler/     # 자소서 → 한국어 (역방향)
   └─ bubbler-maintenance/  # 위 두 스킬의 유지보수 메타 스킬
```

각 기법 디렉토리(`techniques/NN-기법명/`)에는 `example.md` 파일이 있고, 그 안에 다음 정보가 담겨 있습니다.

- 기법 이름과 부제
- Before (원본 평문)
- After (거품 낀 이력서 문체)
- 적용된 변환 패턴 분석

## 스킬

| 스킬 | 방향 | 용도 |
|---|---|---|
| [resume-bubbler](./skills/resume-bubbler/SKILL.md) | 평문 → 자소서 | 일상 표현을 자소서 문체로 격상 |
| [resume-debubbler](./skills/resume-debubbler/SKILL.md) | 자소서 → 평문 | 거품을 빼서 실제 일을 드러냄 |
| [bubbler-maintenance](./skills/bubbler-maintenance/SKILL.md) | (메타) | techniques 변경을 위 두 스킬에 동기화 |

`techniques/`가 단일 진실 공급원이고, `skills/`는 그 파생물입니다. 기법을 추가·수정할 때는 항상 techniques를 먼저 고치고 `bubbler-maintenance` 지침에 따라 스킬을 동기화합니다.

## 아이디어 출처

@yeol.dev

## 제작

hsol.info