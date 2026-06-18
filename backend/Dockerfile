FROM node:22-slim

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

COPY backend/package.json ./package.json
COPY backend/src ./src
COPY frontend/node_modules/postgres ./node_modules/postgres

EXPOSE 4000

CMD ["node", "src/server.js"]
