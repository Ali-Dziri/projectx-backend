# base
FROM node:22-alpine AS base

# deps stage
FROM base AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# build stage
FROM base AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# production run stage
FROM base AS production
WORKDIR /app

ENV NODE_ENV=production

# Copy compiled output and production deps only
COPY --from=build  /app/dist        ./dist
COPY --from=deps   /app/node_modules ./node_modules
COPY package*.json ./

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000

CMD ["node", "dist/main"]