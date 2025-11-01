# 📧 이메일 구독 시스템 사용 가이드

## ✨ 기능 개요
웹사이트 방문자가 이메일 구독 신청을 하면 관리자가 설정한 이메일 주소로 자동으로 알림이 전송됩니다.

---

## 🏗️ 시스템 구조

### 1. 데이터베이스 테이블
```sql
-- 시스템 설정 테이블
CREATE TABLE system_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(255) UNIQUE NOT NULL,
  setting_value TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 구독자 테이블
CREATE TABLE subscribers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  phone VARCHAR(20),
  message TEXT,
  status VARCHAR(20) DEFAULT 'active',
  subscribed_at TIMESTAMP DEFAULT NOW(),
  unsubscribed_at TIMESTAMP
);
```

### 2. API 엔드포인트
- **GET/POST `/api/subscriptionSettings`** - 관리자 이메일 설정 조회/저장
- **POST `/api/subscribe`** - 구독 신청 및 이메일 전송

### 3. UI 컴포넌트
- **AdminDashboardPage**: 관리자 설정 페이지 (설정 탭)
- **Footer**: 구독 신청 폼 (모든 페이지 하단)

---

## ⚙️ 환경 변수 설정

### 1. `.env.local` 파일 생성
`packages/web/.env.local` 파일에 다음 환경 변수를 추가하세요:

```bash
# 이메일 전송 설정 (Gmail 사용 시)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Vercel Postgres (기존 설정)
POSTGRES_URL="..."
POSTGRES_PRISMA_URL="..."
POSTGRES_URL_NON_POOLING="..."
POSTGRES_USER="..."
POSTGRES_HOST="..."
POSTGRES_PASSWORD="..."
POSTGRES_DATABASE="..."
```

### 2. Gmail 앱 비밀번호 생성 방법

1. **Google 계정 → 보안** 이동
2. **2단계 인증** 활성화
3. **앱 비밀번호** 생성
   - 앱: 메일
   - 기기: Windows 컴퓨터
4. 생성된 16자리 비밀번호를 `SMTP_PASS`에 입력

### 3. Vercel 배포 시
Vercel Dashboard → Settings → Environment Variables에 동일한 환경 변수를 추가하세요.

---

## 📝 사용 방법

### 1️⃣ 관리자: 이메일 주소 설정

1. **로그인** (admin@sajuapp.com 또는 관리자 계정)
2. **관리자 대시보드** (`/admin`) 이동
3. **"설정"** 탭 클릭
4. **이메일 주소 입력** (예: admin@sajuapp.com)
5. **"설정 저장"** 버튼 클릭

✅ 이제 구독 신청이 들어오면 이 이메일로 알림이 전송됩니다!

---

### 2️⃣ 사용자: 구독 신청

1. 웹사이트 **하단 Footer** 찾기
2. **"운세 소식을 받아보세요"** 섹션에서 이메일 입력
3. **(선택)** "추가 정보 입력하기" 클릭하여 이름/연락처/메시지 입력
4. **"구독하기"** 버튼 클릭
5. ✅ 구독 완료 알림 확인

---

### 3️⃣ 관리자: 구독 알림 이메일 확인

구독 신청이 들어오면 다음과 같은 이메일을 받게 됩니다:

```
제목: 🔔 새로운 이메일 구독 신청 - user@example.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 새로운 이메일 구독 신청
━━━━━━━━━━━━━━━━━━━━━━━━━━━

이메일    user@example.com
이름      홍길동
연락처    010-1234-5678
메시지    운세 정보를 받아보고 싶습니다.
신청일시  2025-01-01 10:00:00

━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 다음 단계:
구독자와 개별적으로 연락하여 서비스 정보를 제공해주세요.
━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🧪 테스트 방법

### 로컬 테스트

1. **개발 서버 실행**
   ```bash
   cd packages/web
   npm run dev
   ```

2. **브라우저 열기**
   ```
   http://localhost:4000
   ```

3. **Footer까지 스크롤**
4. **이메일 입력 후 구독하기 클릭**
5. **콘솔 확인**:
   - ✅ 성공 메시지
   - ❌ 이메일 전송 경고 (환경 변수 미설정 시)

### API 직접 테스트

```bash
# 관리자 이메일 설정
curl -X POST http://localhost:4000/api/subscriptionSettings \
  -H "Content-Type: application/json" \
  -d '{
    "subscription_email": "admin@sajuapp.com"
  }'

# 구독 신청
curl -X POST http://localhost:4000/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "홍길동",
    "phone": "010-1234-5678",
    "message": "운세 정보를 받아보고 싶습니다."
  }'
```

---

## 🎨 UI 미리보기

### 관리자 설정 페이지
- 위치: `/admin` → "설정" 탭
- 기능: 이메일 주소 설정, 저장, 초기화
- 상태 표시: 저장 중, 저장 완료

### 구독 신청 폼 (Footer)
- **기본 모드**: 이메일만 입력
- **상세 모드**: 이름, 연락처, 메시지 추가 입력
- **상태 표시**: 처리 중, 완료, 에러
- **반응형**: 모바일/데스크톱 대응

---

## 🚨 문제 해결

### 이메일이 전송되지 않는 경우

1. **환경 변수 확인**
   ```bash
   # .env.local 파일 확인
   cat packages/web/.env.local | grep SMTP
   ```

2. **Gmail 앱 비밀번호 확인**
   - 16자리 비밀번호가 정확한지 확인
   - 2단계 인증이 활성화되어 있는지 확인

3. **서버 로그 확인**
   - 브라우저 개발자 도구 → Console
   - 서버 터미널 로그 확인

4. **방화벽 확인**
   - SMTP 포트 587이 열려있는지 확인

### 데이터베이스 테이블이 없는 경우

API 호출 시 자동으로 테이블이 생성됩니다. 수동으로 생성하려면:

```sql
-- Vercel Postgres에 접속하여 실행
CREATE TABLE IF NOT EXISTS system_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(255) UNIQUE NOT NULL,
  setting_value TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscribers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  phone VARCHAR(20),
  message TEXT,
  status VARCHAR(20) DEFAULT 'active',
  subscribed_at TIMESTAMP DEFAULT NOW(),
  unsubscribed_at TIMESTAMP
);
```

---

## 📊 데이터베이스 조회

### 구독자 목록 확인
```sql
SELECT
  id,
  email,
  name,
  phone,
  status,
  subscribed_at
FROM subscribers
ORDER BY subscribed_at DESC;
```

### 관리자 이메일 확인
```sql
SELECT setting_value
FROM system_settings
WHERE setting_key = 'subscription_email';
```

---

## 🔒 보안 고려사항

1. **이메일 검증**: API에서 이메일 형식 검증
2. **중복 방지**: 동일 이메일 중복 구독 방지
3. **SQL Injection 방지**: Vercel Postgres parameterized queries 사용
4. **Rate Limiting**: 향후 추가 권장 (동일 IP 연속 요청 제한)
5. **SMTP 인증**: 앱 비밀번호 사용, 환경 변수로 관리

---

## 🎯 향후 개선 사항

- [ ] 구독자 관리 페이지 (목록 조회, 필터링, 내보내기)
- [ ] 구독 취소 기능
- [ ] 이메일 템플릿 커스터마이징
- [ ] 자동 응답 메일 (구독자에게 환영 메일 전송)
- [ ] 통계 대시보드 (일별/월별 구독자 증가 추이)
- [ ] SendGrid 또는 다른 이메일 서비스 옵션 추가

---

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. 환경 변수 설정
2. 데이터베이스 연결
3. SMTP 서버 연결
4. 서버 로그

---

**작성일**: 2025-11-01
**작성자**: Claude Code
**버전**: 1.0.0
