# Use official Node.js image
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /usr/src/app

# Copy package files first for better layer caching
COPY package*.json ./

# Use npm ci with specific optimizations for faster installs
RUN npm ci --quiet --no-audit --no-fund

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage - use distroless for smaller size
FROM node:18-alpine AS production

# Set the working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install only production dependencies with optimizations
RUN npm ci --only=production --quiet --no-audit --no-fund && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Change ownership
RUN chown -R nestjs:nodejs /usr/src/app
USER nestjs

# Expose port
EXPOSE 4000

# Start the application directly with node
CMD ["node", "dist/main"]
