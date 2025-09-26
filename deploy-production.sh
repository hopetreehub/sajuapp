#!/bin/bash
# 운명나침반 프로덕션 배포 스크립트

echo "🚀 운명나침반 프로덕션 배포 시작"
echo "================================"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 현재 브랜치 확인
echo -e "${YELLOW}📌 현재 브랜치 확인...${NC}"
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "master" ]; then
    echo -e "${RED}❌ master 브랜치가 아닙니다. master 브랜치로 전환해주세요.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ master 브랜치 확인${NC}"

# 2. 변경사항 커밋
echo -e "${YELLOW}📝 변경사항 확인...${NC}"
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}변경사항이 있습니다. 커밋하시겠습니까? (y/n)${NC}"
    read -r COMMIT_CONFIRM
    if [ "$COMMIT_CONFIRM" = "y" ]; then
        git add .
        git commit -m "chore: 프로덕션 배포 준비"
    fi
fi

# 3. 프론트엔드 빌드
echo -e "${YELLOW}🔨 프론트엔드 빌드 시작...${NC}"
cd packages/web
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 프론트엔드 빌드 실패${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 프론트엔드 빌드 완료${NC}"
cd ../..

# 4. 백엔드 서비스 빌드
echo -e "${YELLOW}🔨 백엔드 서비스 빌드 시작...${NC}"

# Calendar Service
cd packages/backend/services/calendar
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Calendar Service 빌드 실패${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Calendar Service 빌드 완료${NC}"
cd ../../../..

# Diary Service
cd packages/backend/services/diary
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Diary Service 빌드 실패${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Diary Service 빌드 완료${NC}"
cd ../../../..

# Saju Analysis Service
cd packages/backend/services/saju-analysis
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Saju Analysis Service 빌드 실패${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Saju Analysis Service 빌드 완료${NC}"
cd ../../../..

# 5. 배포 플랫폼 선택
echo -e "${YELLOW}🎯 배포 플랫폼을 선택하세요:${NC}"
echo "1) Railway (권장)"
echo "2) Vercel + Railway"
echo "3) Cloudflare Pages"
echo "4) 수동 배포"
read -r DEPLOY_OPTION

case $DEPLOY_OPTION in
    1)
        echo -e "${YELLOW}🚂 Railway 배포 시작...${NC}"
        # Railway CLI가 설치되어 있어야 함
        if ! command -v railway &> /dev/null; then
            echo -e "${RED}Railway CLI가 설치되지 않았습니다.${NC}"
            echo "설치: npm i -g @railway/cli"
            exit 1
        fi

        railway up
        echo -e "${GREEN}✅ Railway 배포 완료${NC}"
        ;;

    2)
        echo -e "${YELLOW}🔺 Vercel + Railway 배포 시작...${NC}"

        # Vercel 프론트엔드 배포
        cd packages/web
        vercel --prod
        cd ../..

        # Railway 백엔드 배포
        railway up

        echo -e "${GREEN}✅ Vercel + Railway 배포 완료${NC}"
        ;;

    3)
        echo -e "${YELLOW}☁️ Cloudflare Pages 배포 시작...${NC}"

        cd packages/web
        npx wrangler pages deploy dist --project-name=sajuapp
        cd ../..

        echo -e "${GREEN}✅ Cloudflare Pages 배포 완료${NC}"
        ;;

    4)
        echo -e "${YELLOW}📦 빌드 파일이 준비되었습니다.${NC}"
        echo "프론트엔드: packages/web/dist"
        echo "백엔드: 각 서비스의 dist 폴더"
        ;;

    *)
        echo -e "${RED}잘못된 선택입니다.${NC}"
        exit 1
        ;;
esac

# 6. 배포 확인
echo -e "${YELLOW}🔍 배포 상태 확인...${NC}"
echo "다음 항목을 확인하세요:"
echo "✓ 웹사이트 접속 가능"
echo "✓ API 응답 정상"
echo "✓ 데이터베이스 연결"
echo "✓ 로그인/회원가입 기능"
echo "✓ 캘린더 CRUD"
echo "✓ 사주 분석"

echo -e "${GREEN}🎉 배포가 완료되었습니다!${NC}"
echo "================================"
echo "프로덕션 URL: https://your-domain.com"
echo "관리자 대시보드: https://your-domain.com/admin"
echo "================================"