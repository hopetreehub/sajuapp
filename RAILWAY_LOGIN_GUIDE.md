# 🚂 Railway CLI 로그인 가이드

## 🔐 Railway CLI 로그인 방법

### 방법 1: 브라우저 기반 로그인 (권장)

1. **터미널에서 실행:**
   ```bash
   railway login
   ```

2. **브라우저 자동 열림:**
   - Railway 로그인 페이지가 브라우저에서 자동으로 열립니다
   - 계정: junsupark9999@gmail.com으로 로그인

3. **로그인 성공 확인:**
   ```bash
   railway whoami
   ```

### 방법 2: API 토큰 사용 (CI/CD용)

1. **Railway 대시보드에서 토큰 생성:**
   - https://railway.app/account/tokens 접속
   - "Create Token" 클릭
   - 토큰 복사

2. **환경 변수 설정 (Windows):**
   ```cmd
   set RAILWAY_TOKEN=your_token_here
   ```

3. **환경 변수 설정 (PowerShell):**
   ```powershell
   $env:RAILWAY_TOKEN="your_token_here"
   ```

4. **토큰 확인:**
   ```bash
   railway whoami
   ```

### 방법 3: 수동 브라우저 인증

1. **인증 URL 생성:**
   ```bash
   railway login --browserless
   ```

2. **제공된 URL을 브라우저에 수동으로 입력**

3. **로그인 후 터미널로 돌아와서 확인**

## 🔍 로그인 문제 해결

### "Cannot login in non-interactive mode" 오류
- **원인:** CLI가 브라우저를 열 수 없는 환경
- **해결:**
  1. 새 터미널/CMD 창 열기
  2. 관리자 권한으로 실행
  3. `railway login` 재시도

### "Unauthorized" 오류
- **원인:** 토큰 만료 또는 잘못된 토큰
- **해결:**
  1. `railway logout` 실행
  2. `railway login` 재실행

## 📋 Railway CLI 로그인 후 작업

1. **프로젝트 연결:**
   ```bash
   railway link
   ```

2. **배포:**
   ```bash
   railway up
   ```

3. **로그 확인:**
   ```bash
   railway logs
   ```

## ⚠️ 주의사항

- Railway CLI는 브라우저 기반 인증이 기본
- CI/CD 환경에서는 API 토큰 사용 필수
- 토큰은 안전하게 보관 (절대 커밋하지 말 것)

## 🚀 다음 단계

로그인 성공 후:
1. `railway link`로 프로젝트 연결
2. `railway up`으로 배포 실행
3. Railway 대시보드에서 배포 상태 확인