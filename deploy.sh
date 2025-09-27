#!/bin/bash

# 🚀 유니버설 배포 스크립트
# Cloudflare와 Vercel 둘 다 지원

echo "🎯 배포 플랫폼 선택:"
echo "1) Cloudflare Pages (무료)"
echo "2) Vercel (Pro)"
echo "3) 둘 다 배포 (A/B 테스트)"

read -p "선택 (1-3): " choice

# 빌드
echo "📦 프로젝트 빌드 중..."
cd packages/web
npm run build

case $choice in
  1)
    echo "☁️ Cloudflare Pages 배포 중..."
    wrangler pages deploy dist --project-name=sajuapp-production
    echo "✅ Cloudflare 배포 완료!"
    echo "URL: https://sajuapp-production.pages.dev"
    ;;
  2)
    echo "▲ Vercel 배포 중..."
    vercel --prod
    echo "✅ Vercel 배포 완료!"
    ;;
  3)
    echo "🔄 듀얼 배포 시작..."
    wrangler pages deploy dist --project-name=sajuapp-cf &
    vercel --prod &
    wait
    echo "✅ 두 플랫폼 배포 완료!"
    echo "Cloudflare: https://sajuapp-cf.pages.dev"
    echo "Vercel: https://sajuapp.vercel.app"
    ;;
  *)
    echo "❌ 잘못된 선택"
    exit 1
    ;;
esac

echo "🎉 배포 완료!"