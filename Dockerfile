# Multi-stage Dockerfile for Node.js TypeScript Express app

# --- Builder stage: install deps and build TS to JS ---
FROM node:24-alpine AS builder
WORKDIR /app

# Install build dependencies
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* .npmrc* ./
RUN \
  if [ -f package-lock.json ]; then npm ci --ignore-scripts; \
  elif [ -f pnpm-lock.yaml ]; then npm i -g pnpm && pnpm i --frozen-lockfile --ignore-scripts; \
  elif [ -f yarn.lock ]; then npm i -g yarn && yarn install --frozen-lockfile --ignore-scripts; \
  else npm install --ignore-scripts; fi

# Copy source and build
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
COPY jest.config.ts biome.json ./
RUN npm run build

# --- Production runtime: copy built files and production deps ---
FROM node:24-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Only install production dependencies
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev --ignore-scripts; else npm install --omit=dev --ignore-scripts; fi

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist

# Expose app port (defaults to 3000 via env)
EXPOSE 3000

# Health-friendly start
CMD ["node", "dist/index.js"]
