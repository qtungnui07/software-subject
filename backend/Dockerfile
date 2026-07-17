FROM node:22-slim

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund
COPY backend/src ./src
COPY backend/scripts ./scripts

EXPOSE 4000

CMD ["node", "src/server.js"]
