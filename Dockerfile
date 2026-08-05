# Stage 1: Build workspace
FROM oven/bun:1.3.14-alpine AS builder

WORKDIR /app

# Install exact pnpm version
RUN npm install -g pnpm@11.15.1

# Copy workspace dependencies definitions
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY api/package.json ./api/package.json
COPY web/package.json ./web/package.json

# Install all workspace dependencies
RUN pnpm install --frozen-lockfile

# Copy full source code
COPY . .

# Generate Prisma Client for backend
RUN pnpm --filter api exec bunx prisma generate

# Build Vite web frontend
RUN pnpm --filter web build

# Stage 2: Production runner
FROM oven/bun:1.3.14-alpine AS runner

WORKDIR /app

# Install exact pnpm version for runtime migration helper if needed
RUN npm install -g pnpm@11.15.1

# Copy compiled files and node_modules from builder
COPY --from=builder /app /app

ENV NODE_ENV=prod
ENV PORT=3000

EXPOSE 3000

# Default command to start the unified app
CMD ["bun", "run", "--cwd", "api", "src/index.ts"]
