#!/bin/bash

# GitHub 저장소 연결 스크립트
# 사용법: ./setup-github.sh [저장소명]

REPO_NAME=${1:-fortune-compass}
GITHUB_USER="hopetreehub"

echo "🔗 GitHub 저장소 연결 시작..."
echo "================================"
echo "GitHub User: $GITHUB_USER"
echo "Repository: $REPO_NAME"
echo "================================"

# Git remote 추가
git remote add origin https://github.com/$GITHUB_USER/$REPO_NAME.git

# 현재 브랜치 이름 확인
BRANCH=$(git branch --show-current)

# main 브랜치로 변경 (GitHub 기본)
if [ "$BRANCH" = "master" ]; then
    git branch -M main
fi

# 첫 푸시
echo "📤 GitHub에 코드 푸시 중..."
git push -u origin main

echo "✅ GitHub 저장소 연결 완료!"
echo "================================"
echo "저장소 URL: https://github.com/$GITHUB_USER/$REPO_NAME"
echo "================================"