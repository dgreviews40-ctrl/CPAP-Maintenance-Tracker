# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
# If package-lock.json exists, copy it too for better caching/reproducibility
# We use npm install which is more forgiving if it's missing.
# COPY package-lock.json ./ 

# Install dependencies
RUN npm install

# Copy the rest of the source code (including src/, public/, etc.)
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