# ---------- Stage 1: Build the React app ----------
# Use an official Node image (slim) for a small build environment
FROM node:20-slim AS builder

# Set working directory
WORKDIR /app

# Install **all** dependencies (dev + prod) – needed for the Vite build
COPY package*.json ./
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the app for production
RUN npm run build

# Remove dev‑only packages to keep the layer small (optional but recommended)
# This step runs after the build, so the compiled assets are already present.
RUN npm prune --production

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