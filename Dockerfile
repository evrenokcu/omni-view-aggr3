# Stage 1: Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
#COPY package*.json ./
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application files
COPY components.json tsconfig.json next.config.ts postcss.config.mjs tailwind.config.ts ./
COPY ./src ./src
COPY ./public ./public

# Build the Next.js app
RUN npm run build

# Stage 2: Runtime stage
FROM node:18-alpine

# Install curl (optional) for runtime
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy only the built application and dependencies from the build stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Expose the port Next.js runs on
EXPOSE 3000

VOLUME /price

# Start the Next.js application
CMD ["npm", "start"]