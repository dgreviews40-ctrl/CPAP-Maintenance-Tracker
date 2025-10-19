# ---------- Stage 1: Build the React app ----------
# Use an official Node image (slim) for a small build environment
FROM node:20-slim AS builder

# Set working directory
WORKDIR /app

# Install only production dependencies first (helps with caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the rest of the source code
COPY . .

# Build the app for production
RUN npm run build

# ---------- Stage 2: Serve with Nginx ----------
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose the default HTTP port
EXPOSE 80

# Use the default nginx command
CMD ["nginx", "-g", "daemon off;"]