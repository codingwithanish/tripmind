# ============================================================
# Stage 1: Build TypeScript + Generate Prisma Client
# ============================================================
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files for better Docker layer caching
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source code and build
COPY tsconfig.json ./
COPY src ./src/
RUN npm run build

# ============================================================
# Stage 2: Production runtime
# ============================================================
FROM node:20-alpine AS production

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files and install production-only dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy Prisma schema + migrations (needed for prisma migrate deploy)
COPY prisma ./prisma/
RUN npx prisma generate

# Copy compiled JavaScript from build stage
COPY --from=build /app/dist ./dist/

# Create entrypoint script
RUN printf '#!/bin/sh\nset -e\nnpx prisma migrate deploy\nnode dist/server.js\n' > /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh

# Set ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Environment defaults
ENV NODE_ENV=production
ENV PORT=5000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1

# Use dumb-init to handle PID 1 and signal forwarding
ENTRYPOINT ["dumb-init", "--"]
CMD ["/app/entrypoint.sh"]
