# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and lock file
COPY package.json ./
COPY package-lock.json ./

# Install dependencies using npm ci for reproducible builds
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the project
RUN npm run build

# Stage 2: Create the production image using Nginx
FROM nginx:alpine

# Copy the built assets from the builder stage to the Nginx public directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy a custom Nginx configuration to handle routing (e.g., for React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the default Nginx port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]