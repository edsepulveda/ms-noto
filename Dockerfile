# Stage 1: Dependencies
FROM node:22.10.0-alpine3.20 AS deps
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:22.10.0-alpine3.20 AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

#Generate Prisma Types (before the build to not failed by the linter)
RUN pnpm run prisma:generate

# Build application
RUN pnpm run build

# Remove development dependencies
RUN pnpm prune --prod

# Stage 3: Production
FROM node:22.10.0-alpine3.20 AS runner

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json

# Switch to non-root user
USER nestjs

# Expose application port
EXPOSE 3000

# Set NODE_ENV
ENV NODE_ENV production

# Start the application
CMD ["node", "dist/main"]