# ---------- Stage 1: Build the React app ----------
# Use an official Node image (slim) for a small build environment
FROM node:20-slim AS builder

# Set working directory
WORKDIR /app

# Copy only the package manifests first (helps Docker cache layers)
COPY package*.json ./

# Install **all** dependencies (dev + prod) – required for the Vite build.
# `npm install` works even when a package‑lock.json is absent.
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the app for production (Vite)
RUN npm run build

# Remove dev‑only packages to keep the final layer small.
# This runs after the build, so the compiled assets are already present.
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