# Railway에서 프론트엔드만 빌드하기 위한 Dockerfile
FROM node:18-alpine

WORKDIR /app

# 루트 package.json과 web package.json만 복사
COPY package.json ./
COPY packages/web/package.json ./packages/web/

# web 의존성만 설치
RUN npm install --workspace=packages/web --no-optional

# 웹 소스 코드 복사
COPY packages/web ./packages/web

# 빌드
RUN npm run build --workspace=packages/web

# 서버 시작 (vite preview 사용)
EXPOSE 4000
CMD ["npm", "run", "preview", "--workspace=packages/web", "--", "--host", "0.0.0.0"]