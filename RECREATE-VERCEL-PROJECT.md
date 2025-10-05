# Vercel 프로젝트 재생성 가이드

## 🚨 현재 문제
- Vercel Settings가 오래된 빌드 명령어를 계속 사용
- `cd packages/web` 에러가 반복됨
- Settings 변경이 적용되지 않음

## ✅ 해결: 프로젝트 재생성

---

## 📍 방법 1: 기존 프로젝트 삭제 후 재생성 (추천)

### 1단계: 기존 프로젝트 삭제

1. **프로젝트 Settings 페이지 열기**
   - https://vercel.com/johns-projects-bf5e60f3/sajuapp-web/settings

2. **General 탭에서 맨 아래로 스크롤**
   - "Delete Project" 섹션 찾기

3. **프로젝트 이름 입력 후 삭제**
   - 프로젝트 이름: `sajuapp-web`
   - "Delete" 버튼 클릭

### 2단계: 새 프로젝트 생성

1. **Import 페이지 열기**
   - https://vercel.com/new

2. **GitHub 저장소 선택**
   - "Import Git Repository" 클릭
   - `hopetreehub/sajuapp` 검색
   - "Import" 클릭

3. **프로젝트 설정 (중요!)**

```
Project Name: sajuapp
Framework Preset: Vite
Root Directory: packages/web    ← 중요!
Build Command: (비워둠 - 자동 감지)
Output Directory: dist          ← 중요!
Install Command: (비워둠 - 자동 감지)
```

4. **Deploy 버튼 클릭**

---

## 📍 방법 2: 새 프로젝트 추가 (기존 유지)

기존 프로젝트를 유지하고 싶다면:

1. **새 프로젝트 생성**
   - https://vercel.com/new
   - 같은 GitHub 저장소 선택

2. **다른 이름으로 생성**
   - Project Name: `sajuapp-new`
   - Root Directory: `packages/web`

3. **배포 성공 후 기존 프로젝트 삭제**

---

## 📍 방법 3: vercel.json 강제 적용

Vercel이 vercel.json을 무시하고 있으므로, 프로젝트 루트의 vercel.json을 삭제하고 packages/web/vercel.json을 생성:

### 1단계: 루트 vercel.json 삭제

```bash
cd E:\projects\sajuapp
rm vercel.json
```

### 2단계: packages/web/vercel.json 생성

```bash
cat > packages/web/vercel.json << 'EOF'
{
  "buildCommand": "npm install && npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
EOF
```

### 3단계: Settings에서 Root Directory 변경

- Root Directory: `packages/web`

### 4단계: 커밋 및 푸시

```bash
git add .
git commit -m "fix: move vercel.json to packages/web"
git push
```

---

## 🎯 추천 방법: 방법 1 (프로젝트 재생성)

**장점**:
- 깔끔한 시작
- 오래된 설정 완전히 제거
- 5분 내 완료 가능

**단점**:
- 기존 배포 URL 변경됨
- Deployment 히스토리 삭제됨

---

## 📋 프로젝트 재생성 체크리스트

### 삭제 단계
- [ ] Settings 페이지 열기
- [ ] 맨 아래 "Delete Project" 찾기
- [ ] `sajuapp-web` 입력
- [ ] Delete 버튼 클릭

### 생성 단계
- [ ] https://vercel.com/new 열기
- [ ] GitHub 저장소 선택
- [ ] Project Name: `sajuapp`
- [ ] **Root Directory: `packages/web`** (중요!)
- [ ] Output Directory: `dist`
- [ ] Deploy 버튼 클릭
- [ ] 빌드 완료 대기 (1-3분)

### 확인 단계
- [ ] 빌드 로그에 에러 없음
- [ ] Status: Ready
- [ ] Production URL 접근 가능
- [ ] `/api/customers` 테스트

---

## 💡 Root Directory를 packages/web로 설정하는 이유

```
# Vercel이 인식하는 구조:

sajuapp/ (GitHub 저장소)
  └── packages/
      └── web/ ← Vercel Root Directory
          ├── api/          → /api로 매핑
          ├── src/
          ├── dist/         → Output Directory
          ├── package.json
          └── vite.config.ts
```

**효과**:
- `cd packages/web` 명령 불필요
- 빌드 명령: `npm install && npm run build` (단순)
- API Routes 자동 인식
- vercel.json 단순화

---

## 🚀 즉시 실행

**지금 바로 할 일**:

1. 기존 프로젝트 삭제
   - https://vercel.com/johns-projects-bf5e60f3/sajuapp-web/settings
   - 맨 아래 "Delete Project"

2. 새 프로젝트 생성
   - https://vercel.com/new
   - GitHub 저장소 선택
   - **Root Directory: `packages/web`** 설정 (필수!)
   - Deploy 클릭

3. 배포 완료 대기

**5분이면 완료됩니다!**
