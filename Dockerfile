# Multi-stage build for FinanceFlow Pro Production

# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci --silent

# Copy frontend source
COPY frontend/ ./

# Build frontend for production
RUN npm run build

# Stage 2: Setup Backend
FROM node:18-alpine AS backend-setup
WORKDIR /app/backend

# Copy package files
COPY backend/package*.json ./

# Install production dependencies
RUN npm ci --only=production --silent

# Copy backend source
COPY backend/ ./

# Stage 3: Production Runtime
FROM node:18-alpine AS production
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init curl

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S financeflow -u 1001 -G nodejs

# Copy backend with proper ownership
COPY --from=backend-setup --chown=financeflow:nodejs /app/backend ./backend

# Copy frontend build with proper ownership
COPY --from=frontend-build --chown=financeflow:nodejs /app/frontend/build ./frontend/build

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000
ENV USER=financeflow

# Create logs directory
RUN mkdir -p /app/logs && chown financeflow:nodejs /app/logs

# Expose port
EXPOSE 5000

# Switch to non-root user
USER financeflow

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start application with proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "backend/app.js"]
