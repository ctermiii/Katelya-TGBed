# syntax=docker/dockerfile:1.7
FROM node:22-alpine AS base
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY . .

ENV NODE_ENV=production
EXPOSE 8787
CMD ["node", "index.js"]