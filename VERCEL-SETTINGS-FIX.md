# Vercel Settings 직접 수정 가이드

## 🚨 현재 문제
- 빌드 로그: `sh: line 1: cd: packages/web: No such file or directory`
- 원인: Vercel 프로젝트 설정이 오래된 빌드 명령어 사용 중
- vercel.json이 무시되고 있음

## ✅ 해결 방법 (2가지 옵션)

---

### 옵션 1: Build Command Override (빠른 해결)

**URL**: https://vercel.com/johns-projects-bf5e60f3/sajuapp-web/settings/general

#### 단계:

1. **General Settings 페이지 열기**
   - Settings 탭 클릭
   - General 메뉴 선택

2. **Build & Development Settings 찾기**
   - 페이지를 아래로 스크롤
   - "Build & Development Settings" 섹션 찾기

3. **OVERRIDE 버튼 클릭**
   - Framework Preset 옆의 "Override" 버튼 클릭

4. **다음 값 입력**:

```
Framework Preset: Vite

Build Command:
npm install --prefix packages/web && npm run build --prefix packages/web

Output Directory:
packages/web/dist

Install Command:
npm install --prefix packages/web

Root Directory:
./
```

5. **Save 클릭**

6. **Deployments 탭으로 이동**
   - "Redeploy" 버튼 클릭
   - "Use existing Build Cache" 체크 해제
   - "Redeploy" 확인

---

### 옵션 2: Root Directory 변경 (권장)

이 방법은 더 깔끔하고 안정적입니다.

**URL**: https://vercel.com/johns-projects-bf5e60f3/sajuapp-web/settings/general

#### 단계:

1. **Root Directory 설정**
```
Root Directory: packages/web
```

2. **Build Command 단순화**
```
Build Command: npm install && npm run build
```

3. **Output Directory 단순화**
```
Output Directory: dist
```

4. **Install Command**
```
Install Command: npm install
```

5. **Save 후 Redeploy**

#### 주의사항:
- 이 방법을 사용하려면 `/api` 폴더가 `packages/web/api`에 있어야 함
- 현재 `/api` 폴더 위치 확인 필요

---

## 🎯 추천 해결 순서

### 1단계: 현재 파일 구조 확인
```
sajuapp/
├── packages/
│   └── web/
│       ├── api/          ← API 폴더 위치 확인
│       ├── src/
│       ├── dist/
│       └── package.json
├── vercel.json
└── package.json
```

### 2단계: 옵션 선택

**API 폴더가 `packages/web/api`에 있으면**:
→ 옵션 2 (Root Directory 변경) 사용

**API 폴더가 루트에 있으면**:
→ 옵션 1 (Build Command Override) 사용

### 3단계: Settings 수정

**바로 지금 해야 할 일**:

1. 이 URL 열기:
   https://vercel.com/johns-projects-bf5e60f3/sajuapp-web/settings/general

2. "Build & Development Settings" 섹션 찾기

3. "Override" 버튼 클릭

4. 다음 값 정확히 입력:

```
Build Command:
npm install --prefix packages/web && npm run build --prefix packages/web

Output Directory:
packages/web/dist

Install Command:
npm install --prefix packages/web
```

5. "Save" 버튼 클릭 (중요!)

6. Deployments 탭으로 이동

7. "Redeploy" 버튼 클릭

---

## 🔍 저장 확인 방법

Settings를 저장한 후:
1. 페이지 새로고침
2. Build & Development Settings 다시 확인
3. 입력한 값이 그대로 있는지 확인

저장이 안 되었다면:
- 브라우저 콘솔에서 에러 확인 (F12)
- 다른 브라우저로 시도
- Vercel 지원팀에 문의

---

## 📝 현재 API 폴더 위치

확인 필요:
```bash
ls -la packages/web/api
```

만약 `packages/web/api`가 존재하면:
→ 옵션 2 (Root Directory 변경) 사용 가능

만약 존재하지 않으면:
→ 옵션 1 (Build Command Override) 사용

---

## ✅ 성공 확인

배포가 성공하면 빌드 로그에 다음이 표시됨:
```
Running "npm install --prefix packages/web"
...
Running "npm run build --prefix packages/web"
...
Build Completed
```

실패하면 다른 에러 메시지가 나타남 (그때 다시 확인)

---

## 🚀 즉시 실행 체크리스트

- [ ] Vercel Settings 페이지 열기
- [ ] Build & Development Settings 찾기
- [ ] Override 버튼 클릭
- [ ] Build Command 입력: `npm install --prefix packages/web && npm run build --prefix packages/web`
- [ ] Output Directory 입력: `packages/web/dist`
- [ ] Install Command 입력: `npm install --prefix packages/web`
- [ ] Save 버튼 클릭
- [ ] Deployments 탭으로 이동
- [ ] Redeploy 버튼 클릭
- [ ] 빌드 로그 확인

**지금 바로 Vercel Settings 페이지를 열어서 Build Command를 수정해주세요!**
