# Stage 1: Build workspace with Node 22 (full pnpm compatibility)
FROM node:22-alpine AS builder

WORKDIR /app

# Install exact pnpm version
RUN npm install -g pnpm@11.15.1

# Copy workspace dependencies definitions and Prisma schema
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY api/package.json ./api/package.json
COPY api/prisma ./api/prisma
COPY web/package.json ./web/package.json

# Install all workspace dependencies (generates Prisma client via postinstall)
RUN pnpm install --frozen-lockfile

# Copy remaining source code
COPY . .

# Build Vite web frontend
RUN pnpm --filter web build

# Stage 2: Production runner with Bun
FROM oven/bun:1.3.14-alpine AS runner

WORKDIR /app

# Copy compiled files and node_modules from builder
COPY --from=builder /app /app

ENV NODE_ENV=prod
ENV PORT=3000

EXPOSE 3000

# Default command to start the unified app
CMD ["bun", "run", "--cwd", "api", "src/index.ts"]
