# Stage 1: Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application files
COPY components.json tsconfig.json next.config.ts postcss.config.mjs tailwind.config.ts ./
COPY ./src ./src
COPY ./public ./public

# Build the Next.js app
RUN npm run build

# Prune dev dependencies to reduce final image size
RUN npm prune --production


# Stage 2: Runtime stage
FROM node:18-alpine

# Set working directory and production environment variable
WORKDIR /app
ENV NODE_ENV=production

# Copy only the built application and production dependencies from the build stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Expose the port Next.js runs on
EXPOSE 3000

# Declare volume for persistent storage
VOLUME /price

# Start the Next.js application
CMD ["npm", "start"]
