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

# Empaqueta la API con solo sus dependencias de producción (prisma CLI es dependencia de producción: migraciones)
RUN CI=true pnpm --filter api deploy --legacy --prod /deploy

# Stage 2: Production runner with Bun
FROM oven/bun:1.3.14-alpine AS runner

WORKDIR /app

# Solo lo necesario para ejecutar: la API desplegada, el cliente Prisma generado (ignorado por git, no lo copia deploy) y el build del frontend
COPY --from=builder --chown=bun:bun /deploy ./api
COPY --from=builder --chown=bun:bun /app/api/src/generated ./api/src/generated
COPY --from=builder --chown=bun:bun /app/web/dist ./web/dist

# El volumen de uploads hereda este propietario al montarse por primera vez
RUN mkdir -p /app/api/uploads && chown -R bun:bun /app/api/uploads

ENV NODE_ENV=prod
ENV PORT=3000

EXPOSE 3000

USER bun

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD bun -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Default command to start the unified app
CMD ["bun", "run", "--cwd", "api", "src/index.ts"]
