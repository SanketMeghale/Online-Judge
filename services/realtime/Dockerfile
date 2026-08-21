FROM node:20-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY judge-service/package.json judge-service/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY services/realtime/package.json services/realtime/package.json
RUN npm ci --omit=dev
COPY services/realtime services/realtime
EXPOSE 4001
CMD ["npm", "--workspace", "services/realtime", "run", "start"]
