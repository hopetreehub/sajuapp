# CI/CD 파이프라인 설정 가이드

## 📋 개요
GitHub Actions를 사용한 자동화된 테스트 및 배포 파이프라인 설정 방법입니다.

---

## 🔧 필수 준비사항

### 1. Vercel 계정 정보

1. **Vercel Token 생성**
   - https://vercel.com/account/tokens 접속
   - "Create" 클릭
   - Token 이름: `github-actions-deploy`
   - Scope: Full Account
   - **중요**: 생성된 토큰을 안전하게 복사 (다시 볼 수 없음)

2. **프로젝트 ID 확인**
   ```bash
   # Vercel CLI로 확인
   vercel project ls

   # 또는 .vercel/project.json 파일 확인
   cat .vercel/project.json
   ```

3. **Organization ID 확인**
   ```bash
   # Vercel CLI로 확인
   vercel whoami

   # 또는 Vercel 대시보드 → Settings → General
   ```

---

## 🔑 GitHub Secrets 설정

### 1. Repository Secrets 추가

1. **GitHub Repository 접속**
   - https://github.com/[YOUR_USERNAME]/sajuapp

2. **Settings → Secrets and variables → Actions**

3. **New repository secret 클릭 후 다음 3개 추가**:

#### VERCEL_TOKEN
```
Value: [위에서 생성한 Vercel Token]
```

#### VERCEL_ORG_ID
```
Value: [Vercel Organization ID]
예: team_abc123xyz
```

#### VERCEL_PROJECT_ID
```
Value: [Vercel Project ID]
예: prj_abc123xyz
```

---

## 🚀 워크플로우 설명

### 1. Deploy Workflow (`deploy.yml`)

**트리거**:
- `main` 또는 `master` 브랜치에 푸시
- 수동 실행 (workflow_dispatch)

**작업 순서**:
1. ✅ 코드 체크아웃
2. ✅ Node.js 20 설정
3. ✅ 의존성 설치 (`npm ci`)
4. ✅ Lint 검사
5. ✅ 타입 체크 (선택사항)
6. ✅ 프로덕션 빌드
7. ✅ Vercel 배포
8. ✅ 성공/실패 알림

**환경 변수**:
- `VITE_APP_NAME`: 운명나침반
- `VITE_APP_VERSION`: 2.0.0
- `BUILD_VERSION`: 빌드 번호 (자동)

### 2. Test Workflow (`test.yml`)

**트리거**:
- Pull Request (main, master, develop)
- Feature/Fix 브랜치 푸시

**작업**:
1. **Lint**: ESLint 검사
2. **Type Check**: TypeScript 타입 검사
3. **Build Test**: 빌드 성공 여부 확인
4. **Security Audit**: npm audit 실행
5. **Test Summary**: 전체 결과 요약

---

## 📊 사용 방법

### 1. 자동 배포 (Continuous Deployment)

```bash
# main 브랜치에 푸시 시 자동 배포
git checkout main
git merge feature/your-feature
git push origin main

# GitHub Actions가 자동으로:
# 1. 테스트 실행
# 2. 빌드
# 3. Vercel 배포
```

### 2. 수동 배포

1. GitHub → Actions → "Deploy to Vercel Production"
2. "Run workflow" 클릭
3. 브랜치 선택 (main)
4. "Run workflow" 확인

### 3. Pull Request 자동 테스트

```bash
# Feature 브랜치에서 PR 생성
git checkout -b feature/new-feature
git push origin feature/new-feature

# GitHub에서 PR 생성
# → 자동으로 Lint, Type Check, Build Test 실행
```

---

## 🔍 워크플로우 모니터링

### 1. 실시간 로그 확인

1. GitHub → Actions 탭
2. 실행 중인 워크플로우 클릭
3. 각 단계별 로그 확인

### 2. 실패 시 디버깅

```bash
# 로컬에서 동일한 명령 실행
cd packages/web

# Lint 체크
npm run lint

# 타입 체크
npm run type-check

# 빌드 테스트
npm run build

# 문제가 있으면 수정 후 다시 푸시
git add .
git commit -m "fix: CI/CD 에러 수정"
git push
```

---

## 📈 배지 추가 (선택사항)

`README.md`에 상태 배지 추가:

```markdown
![Deploy Status](https://github.com/[USERNAME]/sajuapp/actions/workflows/deploy.yml/badge.svg)
![Test Status](https://github.com/[USERNAME]/sajuapp/actions/workflows/test.yml/badge.svg)
```

---

## ⚠️ 주의사항

### 1. Secrets 보안
- ❌ Secrets를 코드에 하드코딩하지 말 것
- ❌ Secrets를 로그에 출력하지 말 것
- ✅ GitHub Secrets만 사용
- ✅ 정기적으로 토큰 갱신

### 2. 브랜치 보호 규칙

`main` 브랜치 보호 권장:
1. Settings → Branches → Branch protection rules
2. "Require status checks to pass before merging" 체크
3. 필수 검사 선택:
   - Lint Code
   - Build Test

### 3. 비용 고려

- GitHub Actions: 공개 저장소 무료
- Vercel 배포: Hobby 플랜 무제한
- 프라이빗 저장소: 월 2,000분 무료

---

## 🔧 트러블슈팅

### 1. "Vercel Token이 유효하지 않습니다"

**해결**:
```bash
# 새 토큰 생성
vercel token create github-actions

# GitHub Secrets 업데이트
```

### 2. "프로젝트를 찾을 수 없습니다"

**해결**:
```bash
# 프로젝트 ID 확인
vercel project ls

# VERCEL_PROJECT_ID Secret 업데이트
```

### 3. "빌드가 실패합니다"

**해결**:
```bash
# 로컬에서 프로덕션 빌드 테스트
cd packages/web
npm run build

# 에러 확인 및 수정
npm run lint
npm run type-check
```

### 4. "의존성 설치 실패"

**해결**:
```bash
# package-lock.json 재생성
rm -rf node_modules package-lock.json
npm install

# 변경사항 커밋
git add package-lock.json
git commit -m "fix: package-lock.json 업데이트"
```

---

## 📚 추가 리소스

- [GitHub Actions 문서](https://docs.github.com/en/actions)
- [Vercel GitHub Integration](https://vercel.com/docs/deployments/git)
- [GitHub Actions Marketplace](https://github.com/marketplace?type=actions)

---

## 🔄 향후 개선 사항

- [ ] E2E 테스트 자동화 (Playwright)
- [ ] 코드 커버리지 리포트
- [ ] 자동 롤백 기능
- [ ] Slack/Discord 알림 통합
- [ ] Preview 배포 (PR별)
- [ ] 성능 테스트 (Lighthouse CI)
- [ ] Dependency 자동 업데이트 (Dependabot)

---

**작성**: PHASE2-003-4
**버전**: 1.0.0
**마지막 업데이트**: 2025-01-XX
