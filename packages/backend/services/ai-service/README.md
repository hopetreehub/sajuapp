# 🤖 AI Fortune Interpretation Service

DeepInfra 기반 사주 운세 해석 및 다이어리 인사이트 AI 서비스

## 🌟 주요 기능

### 🔮 운세 해석 서비스
- **일일 운세**: 개인의 사주 기반 일일 운세 해석
- **주간 운세**: 일주일간의 운세 전망 및 조언
- **월간 운세**: 월간 운세 해석 및 방향성 제시
- **직업별 특화**: 직장인, 사업자, 학생 등 맞춤형 해석

### 📖 다이어리 인사이트
- **감정 분석**: 다이어리 내용 기반 감정 상태 분석
- **사주 연관 분석**: 개인 사주와 일상 경험의 연관성 해석
- **개인 성장 조언**: 맞춤형 성장 방향 및 실천 방안 제시
- **패턴 분석**: 이전 인사이트와 연계한 성장 패턴 분석

## 🏗️ 아키텍처

### AI 서비스 우선순위
1. **DeepInfra** (주력) - Qwen/Qwen2.5-32B-Instruct
2. **OpenAI** (백업) - GPT-3.5-Turbo
3. **Google Gemini** (백업) - Gemini-Pro
4. **Anthropic Claude** (백업) - Claude-3-Haiku
5. **Cohere** (백업) - Command-Light

### 핵심 컴포넌트
- **AI Orchestrator**: 지능형 프로바이더 라우팅 및 장애 복구
- **Prompt Templates**: 전문적인 명리학 프롬프트 관리
- **Cache System**: 응답 캐싱으로 성능 최적화
- **Metrics System**: 실시간 서비스 모니터링
- **Error Handling**: 포괄적 에러 처리 및 복구

## 🚀 빠른 시작

### 환경 설정

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env
# .env 파일에서 API 키 설정 필요
```

### 필수 환경변수

```env
# DeepInfra 설정 (필수)
DEEPINFRA_API_KEY=8cb0ACaBs5No54Dvn687iKhE11TPHCr9
DEEPINFRA_BASE_URL=https://api.deepinfra.com/v1/openai
DEEPINFRA_DEFAULT_MODEL=Qwen/Qwen2.5-32B-Instruct

# 서비스 설정
PORT=5003
NODE_ENV=development

# 기타 AI 서비스 키 (선택사항)
OPENAI_API_KEY=your_openai_key_here
GOOGLE_AI_API_KEY=your_google_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
COHERE_API_KEY=your_cohere_key_here
```

### 서버 실행

```bash
# 개발 모드
npm run dev

# 프로덕션 빌드
npm run build
npm start

# 테스트
npm test
```

## 📖 API 사용법

### 인증

```bash
# API 키 헤더 방식
curl -H "X-API-Key: saju-dev-key-12345" \
     http://localhost:5003/api/v1/health

# Bearer 토큰 방식
curl -H "Authorization: Bearer your-token-here" \
     http://localhost:5003/api/v1/health
```

### 일일 운세 해석

```bash
curl -X POST http://localhost:5003/api/v1/fortune/daily \
  -H "Content-Type: application/json" \
  -H "X-API-Key: saju-dev-key-12345" \
  -d '{
    "sajuData": {
      "fourPillars": {
        "year": {"stem": "갑", "branch": "자"},
        "month": {"stem": "을", "branch": "축"},
        "day": {"stem": "병", "branch": "인"},
        "hour": {"stem": "정", "branch": "묘"}
      },
      "tenGods": ["정관", "편재", "식신", "상관"],
      "spiritGods": [
        {"name": "천을귀인", "type": "auspicious"},
        {"name": "역마", "type": "inauspicious"}
      ],
      "elements": {
        "primary": "목",
        "secondary": "화",
        "weakness": "금",
        "strength": "수"
      },
      "currentAge": 30,
      "gender": "male"
    },
    "targetDate": "2025-01-15T00:00:00Z",
    "profession": "office_worker",
    "focusAreas": ["work", "health", "relationships"],
    "systemPrompt": "당신은 전문 명리학자입니다.",
    "userPrompt": "오늘의 운세를 해석해주세요.",
    "requestType": "fortune_interpretation"
  }'
```

### 다이어리 인사이트 분석

```bash
curl -X POST http://localhost:5003/api/v1/diary/insights \
  -H "Content-Type: application/json" \
  -H "X-API-Key: saju-dev-key-12345" \
  -d '{
    "diaryContent": "오늘은 회사에서 중요한 프로젝트를 성공적으로 마무리했다. 팀원들과의 협업도 원활했고, 상사로부터 좋은 평가를 받았다.",
    "mood": 4,
    "sajuData": { /* 동일한 사주 데이터 */ },
    "previousInsights": ["최근 업무 성과가 좋아지고 있음"],
    "systemPrompt": "당신은 개인 성장을 돕는 라이프 코치입니다.",
    "userPrompt": "다이어리 내용을 분석해주세요.",
    "requestType": "diary_insights"
  }'
```

## 🔧 API 테스트

### 자동 테스트 실행

```bash
# 통합 테스트
npm test

# API 테스트 스크립트 (서버가 실행 중이어야 함)
node scripts/test-api.js

# 인터랙티브 모드
node scripts/test-api.js --interactive

# 개별 테스트
node scripts/test-api.js --health
node scripts/test-api.js --fortune
node scripts/test-api.js --diary
```

### 헬스체크

```bash
# 기본 헬스체크
curl http://localhost:5003/api/v1/health

# 상세 헬스체크 (AI 프로바이더 상태 포함)
curl http://localhost:5003/api/v1/health/detailed

# 프로바이더별 상태
curl http://localhost:5003/api/v1/health/providers

# 메트릭스
curl http://localhost:5003/api/v1/health/metrics
```

## 📊 모니터링 및 메트릭스

### 실시간 메트릭스
- 요청 성공률 및 응답 시간
- AI 프로바이더별 성능 통계
- 토큰 사용량 및 비용 추적
- 캐시 히트율 및 효율성
- 에러율 및 장애 복구 현황

### 로그 관리
```bash
# 로그 파일 위치
logs/
├── combined.log    # 전체 로그
├── error.log       # 에러 로그
├── exceptions.log  # 예외 로그
└── rejections.log  # Promise rejection 로그
```

### 알림 및 경고
- 높은 에러율 발생 시 자동 알림
- AI 프로바이더 장애 감지 및 페일오버
- 비용 임계값 초과 경고
- 응답 시간 성능 저하 모니터링

## 🛡️ 보안 및 인증

### API 키 관리
```env
# 개발용 API 키 (예시)
saju-dev-key-12345
ai-service-key-67890
fortune-api-key-abcde

# 관리자용 키
saju-admin-key-xyz
ai-service-admin-key
```

### 보안 기능
- Helmet.js 보안 헤더
- CORS 정책 적용
- 요청 속도 제한
- IP 기반 접근 제어
- 입력 유효성 검증
- SQL 인젝션 방지

## 💡 프롬프트 템플릿

### 직업별 특화 템플릿

#### 직장인 전용
```
당신은 직장인 전문 명리학 상담사입니다.
- 직장 내 인간관계와 상사-부하 관계 분석
- 승진과 이직 타이밍 조언
- 업무 성과 향상 방향성 제시
- 워라밸과 성장 동시 추구
```

#### 사업자 전용
```
당신은 사업 운영에 특화된 명리학 전문가입니다.
- 사업 타이밍과 의사결정 포인트 분석
- 파트너십과 투자 관련 길흉 판단
- 마케팅과 영업 전략의 명리학적 접근
- 지속가능한 성장을 위한 기반 구축
```

### 템플릿 관리
- 동적 변수 치환 시스템
- 버전 관리 및 A/B 테스트
- 성과 기반 템플릿 최적화
- 사용자 피드백 반영

## 🔄 페일오버 및 로드밸런싱

### 지능형 프로바이더 선택
1. **비용 최적화**: 무료 서비스 우선 활용
2. **성능 기반**: 응답 시간 및 성공률 고려
3. **할당량 관리**: 일일 사용량 모니터링
4. **자동 페일오버**: 장애 발생 시 즉시 대체

### 캐싱 전략
- 동일한 요청에 대한 응답 캐싱
- TTL 기반 자동 만료
- 메모리 사용량 최적화
- 캐시 히트율 모니터링

## 🚦 성능 최적화

### 비용 절약 전략
- DeepInfra 주력 사용 (저비용)
- 무료 티어 서비스 활용
- 토큰 사용량 최적화
- 응답 캐싱으로 중복 요청 제거

### 속도 최적화
- 비동기 처리 및 병렬 요청
- 연결 풀링 및 Keep-Alive
- 응답 압축 (gzip/brotli)
- CDN 활용 (프로덕션)

## 📈 확장성

### 수평 확장
- 무상태(Stateless) 서비스 설계
- 로드밸런서 호환
- 세션 외부 저장소 활용
- 컨테이너 기반 배포

### 마이크로서비스 통합
- API Gateway 연동
- 서비스 디스커버리
- 분산 트레이싱
- 회로 차단기 패턴

## 🔧 문제 해결

### 일반적인 문제

#### AI 서비스 응답 없음
```bash
# 프로바이더 상태 확인
curl http://localhost:5003/api/v1/health/providers

# 네트워크 연결 테스트
curl -I https://api.deepinfra.com

# 로그 확인
tail -f logs/error.log
```

#### 높은 응답 시간
```bash
# 메트릭스 확인
curl http://localhost:5003/api/v1/health/metrics

# 캐시 상태 점검
# 로드 테스트 수행
```

#### 인증 오류
```bash
# API 키 확인
grep "API_KEY" .env

# 헤더 형식 확인
curl -H "X-API-Key: your-key" ...
```

### 디버깅 모드

```bash
# 상세 로그 활성화
LOG_LEVEL=debug npm run dev

# 개별 프로바이더 테스트
node -e "
const { DeepInfraService } = require('./dist/services/providers/deepinfra.service');
// 테스트 코드
"
```

## 🤝 기여 방법

### 개발 가이드라인
1. TypeScript 엄격 모드 준수
2. ESLint 규칙 따르기
3. 테스트 코드 작성 필수
4. 보안 취약점 점검

### 코드 컨트리뷰션
```bash
# 개발 환경 설정
git clone <repository>
npm install
npm run dev

# 테스트 실행
npm test
npm run lint

# 빌드 확인
npm run build
```

## 📚 추가 리소스

### 관련 문서
- [DeepInfra API Documentation](https://deepinfra.com/docs)
- [전통 명리학 기초](../docs/saju-basics.md)
- [프롬프트 엔지니어링 가이드](../docs/prompt-engineering.md)

### 외부 서비스
- [OpenAI API](https://platform.openai.com/docs)
- [Google AI Studio](https://ai.google.dev)
- [Anthropic Claude](https://docs.anthropic.com)
- [Cohere API](https://docs.cohere.com)

## 📄 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

---

**🔮 운명나침반 AI 서비스** - DeepInfra 기반 전문 사주 운세 해석 시스템