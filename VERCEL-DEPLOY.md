# Vercel 배포 가이드

## 🚀 새 프로젝트 생성 및 배포

### 1단계: Vercel에 새 프로젝트 만들기

1. **Vercel 대시보드 접속**
   - https://vercel.com 접속
   - `junsupark9999@gmail.com` 계정으로 로그인

2. **GitHub 저장소 Import**
   - "Add New Project" 또는 "Import Project" 클릭
   - GitHub 연동 확인
   - `hopetreehub/sajuapp` 저장소 선택

3. **프로젝트 설정**
   - **Project Name**: `sajuapp`
   - **Framework Preset**: `Vite`
   - **Root Directory**: 기본값 유지 (루트)
   - **Build Command**: vercel.json에서 자동으로 읽음
   - **Output Directory**: vercel.json에서 자동으로 읽음

### 2단계: 환경 변수 설정 (필요 시)

현재는 환경 변수 없음. 필요 시 추가.

### 3단계: 배포 설정 확인

**vercel.json** 파일이 이미 구성되어 있음:

```json
{
  "buildCommand": "npm install --prefix packages/web && npm run build --prefix packages/web",
  "outputDirectory": "packages/web/dist",
  "installCommand": "npm install --prefix packages/web",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 4단계: 배포 트리거

**자동 배포 (추천)**
- `main` 브랜치에 푸시하면 자동 배포
- GitHub Actions 불필요 (Vercel이 자동 감지)

**수동 배포**
```bash
npx vercel --prod
```

## 🔧 문제 해결

### 404: DEPLOYMENT_NOT_FOUND 에러

**원인**: 기존 프로젝트가 삭제됨

**해결**:
1. Vercel 대시보드에서 새 프로젝트 생성
2. GitHub 저장소 다시 연결
3. 위의 1-4단계 진행

### 빌드 에러: packages/web 디렉토리 찾을 수 없음

**해결됨**: vercel.json에서 `npm --prefix packages/web` 방식으로 수정함

### API Routes 설정

Vercel Serverless Functions:
- `/api` 폴더가 자동으로 Serverless Functions로 변환
- `packages/web/api/customers.ts` → `/api/customers` 엔드포인트

## 📦 배포 후 확인 사항

1. **프론트엔드 정상 작동**
   - 메인 페이지 로드 확인
   - 라우팅 동작 확인

2. **API 엔드포인트 테스트**
   - GET `/api/customers` - 고객 목록 조회
   - POST `/api/customers` - 고객 등록
   - GET `/api/customers?id=1` - 고객 상세 조회

3. **주능/주흉 레이더 차트**
   - 통합 사주 레이더 분석 페이지
   - 주능/주흉 차트 정상 표시

## 🌐 배포 URL

배포 완료 후 URL:
- Production: `https://sajuapp.vercel.app` (또는 Vercel이 할당한 URL)
- Preview: 각 커밋마다 생성

## 📝 현재 상태

- ❌ 기존 프로젝트 삭제됨 (404 에러)
- ✅ vercel.json 설정 완료
- ✅ 최신 코드 GitHub에 푸시됨
- ⏳ 새 프로젝트 생성 필요

**다음 조치**: Vercel 대시보드에서 새 프로젝트 생성
