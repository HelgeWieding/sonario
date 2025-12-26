FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies (use npm install to properly resolve platform-specific bindings)
RUN npm install --ignore-scripts

# Copy source code
COPY . .

# Now run prepare and build
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copy built output
COPY --from=builder /app/.output ./.output

# Copy files needed for migrations
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/server/db ./server/db
COPY --from=builder /app/node_modules ./node_modules

# Copy entrypoint script
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

CMD ["./docker-entrypoint.sh"]
