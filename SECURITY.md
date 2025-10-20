# 운명나침반 보안 정책

## 📋 개요
본 문서는 운명나침반 애플리케이션의 보안 정책과 구현된 보안 기능을 설명합니다.

---

## 🛡️ 구현된 보안 기능

### 1. Rate Limiting (속도 제한)

**목적**: DDoS 공격 및 무차별 대입 공격 방지

**구현 방식**:
- 메모리 기반 Rate Limiter
- IP 주소 또는 User ID 기반 식별
- 기본 설정: 60 requests/minute

**응답 헤더**:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 2025-01-XX...
```

**초과 시 응답**:
```json
{
  "error": "Too Many Requests",
  "message": "요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.",
  "retryAfter": 30
}
```

**프로덕션 권장사항**:
- Vercel KV 또는 Redis 사용
- 분산 환경에서의 Rate Limiting
- 사용자별 세밀한 제한 설정

---

### 2. CORS (Cross-Origin Resource Sharing)

**목적**: 허가된 도메인에서만 API 접근 허용

**허용된 Origin**:
```
https://sajuapp.vercel.app
https://sajuapp-prod.vercel.app
http://localhost:4000 (개발용)
```

**CORS 헤더**:
```
Access-Control-Allow-Origin: [허용된 origin]
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

**Preflight 요청**: OPTIONS 메서드 자동 처리

---

### 3. XSS (Cross-Site Scripting) 방지

**목적**: 악의적인 스크립트 실행 방지

**구현 방식**:
1. **입력 Sanitization**:
   ```typescript
   sanitizeInput(input: string): string {
     return input
       .replace(/</g, '&lt;')
       .replace(/>/g, '&gt;')
       .replace(/"/g, '&quot;')
       .replace(/'/g, '&#x27;')
       .replace(/\//g, '&#x2F;');
   }
   ```

2. **보안 헤더**:
   ```
   X-Content-Type-Options: nosniff
   X-Frame-Options: DENY
   X-XSS-Protection: 1; mode=block
   ```

3. **CSP (Content Security Policy)**:
   ```
   default-src 'self';
   script-src 'self' 'unsafe-inline' 'unsafe-eval';
   style-src 'self' 'unsafe-inline';
   img-src 'self' data: https:;
   ```

---

### 4. SQL Injection 방지

**목적**: 데이터베이스 공격 방지

**구현 방식**:

1. **Parameterized Queries** (Primary Defense):
   ```typescript
   await sql`
     SELECT * FROM customers
     WHERE id = ${id}
   `;
   ```

2. **입력 검증** (Secondary Defense):
   ```typescript
   detectSQLInjection(input: string): boolean {
     const sqlPatterns = [
       /(\bUNION\b.*\bSELECT\b)/i,
       /(\bDROP\b.*\bTABLE\b)/i,
       /(\bINSERT\b.*\bINTO\b)/i,
       ...
     ];
     return sqlPatterns.some(pattern => pattern.test(input));
   }
   ```

3. **에러 메시지 제한**:
   - SQL 에러를 직접 노출하지 않음
   - 일반적인 에러 메시지 반환

---

### 5. CSRF (Cross-Site Request Forgery) 방지

**목적**: 위조된 요청 방지

**구현 방식** (향후 적용):
```typescript
// 토큰 생성
const csrfToken = generateCSRFToken();

// 토큰 검증
if (!verifyCSRFToken(req, expectedToken)) {
  return res.status(403).json({ error: 'Invalid CSRF token' });
}
```

**헤더**:
```
X-CSRF-Token: [token]
```

---

### 6. 인증 보안 헤더

**Referrer-Policy**:
```
Referrer-Policy: strict-origin-when-cross-origin
```

**Permissions-Policy**:
```
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## 🔒 데이터베이스 보안

### 1. 연결 보안
- Vercel Postgres: SSL/TLS 암호화
- 연결 풀링: 자동 관리
- 환경 변수: Vercel 환경변수로 보호

### 2. 접근 제어
- 최소 권한 원칙
- 프로덕션 DB: 읽기/쓰기 분리 (향후)
- 백업: 자동 백업 활성화

### 3. 감사 로그
- 관리자 활동 로그 (`audit_logs` 테이블)
- IP 주소, User Agent 기록
- 중요 작업 추적

---

## 🧪 보안 테스트

### 1. 수동 테스트

**XSS 테스트**:
```bash
curl -X POST https://sajuapp.vercel.app/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "<script>alert(\"XSS\")</script>",
    "birth_date": "1990-01-01",
    "birth_time": "12:00:00",
    "gender": "male",
    "lunar_solar": "solar"
  }'

# 기대 결과: 입력이 sanitize되어 저장됨
```

**SQL Injection 테스트**:
```bash
curl https://sajuapp.vercel.app/api/customers?id=1%27%20OR%20%271%27=%271

# 기대 결과: 400 Bad Request
```

**Rate Limiting 테스트**:
```bash
# 61회 연속 요청
for i in {1..61}; do
  curl https://sajuapp.vercel.app/api/customers
done

# 기대 결과: 61번째 요청에서 429 Too Many Requests
```

### 2. 자동화 테스트 (향후)

- OWASP ZAP 스캔
- Burp Suite 취약점 스캔
- GitHub Dependabot 알림

---

## 📊 보안 모니터링

### 1. 로그 모니터링
```bash
# Vercel 로그 확인
vercel logs --filter error

# Rate Limit 초과 확인
vercel logs | grep "429"

# 의심스러운 입력 확인
vercel logs | grep "SQL Injection"
```

### 2. 알림 설정 (권장)
- Sentry: 에러 추적
- DataDog: 성능 모니터링
- PagerDuty: 인시던트 알림

---

## 🚨 취약점 보고

### 보안 취약점을 발견하셨나요?

1. **이메일**: security@운명나침반.com
2. **GitHub Issues**: (보안 이슈는 비공개로)
3. **응답 시간**: 48시간 이내

### 보고 시 포함 사항
- 취약점 설명
- 재현 단계
- 영향 범위
- 권장 해결 방법 (선택사항)

---

## 📖 참고 자료

### 보안 가이드
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Vercel Security](https://vercel.com/docs/security)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

### 관련 도구
- [helmet.js](https://helmetjs.github.io/): Node.js 보안 헤더
- [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit)
- [csurf](https://github.com/expressjs/csurf): CSRF 방지

---

## 🔄 업데이트 이력

| 날짜 | 버전 | 변경사항 |
|------|------|----------|
| 2025-01-XX | 1.0.0 | 초기 보안 정책 작성 |
| - | - | Rate Limiting 구현 |
| - | - | XSS 방지 구현 |
| - | - | SQL Injection 방지 구현 |

---

**마지막 업데이트**: PHASE2-003-3 (2025-01-XX)
