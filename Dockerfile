FROM node:18
WORKDIR /app
COPY server/package*.json ./
RUN npm ci
COPY server/ .
RUN npx prisma generate
RUN npm run build
EXPOSE 4000
CMD npx prisma migrate deploy && node dist/src/index.js
