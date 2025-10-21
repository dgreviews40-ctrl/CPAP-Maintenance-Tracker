# Stage 1: Build the React application
FROM node:20-slim as builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

# Copy source code and build
COPY . .
RUN pnpm run build

# Stage 2: Serve the application using Nginx
FROM nginx:alpine

# Copy the built application files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy our simple nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]