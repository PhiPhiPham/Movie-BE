FROM node:20 AS base
WORKDIR /app

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20 AS production
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --omit=dev
COPY --from=base /app/dist ./dist
COPY --from=base /app/prisma ./prisma
RUN npx prisma generate

EXPOSE 3000
CMD ["node", "dist/main.js"]
