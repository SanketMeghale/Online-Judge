FROM node:20-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY judge-service/package.json judge-service/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY services/realtime/package.json services/realtime/package.json
RUN npm ci --omit=dev
COPY apps/api apps/api
COPY packages/shared packages/shared
EXPOSE 4000
CMD ["npm", "run", "start:api"]
