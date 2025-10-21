# Stage 1: Build the React application
FROM node:20-slim as builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:alpine as runner

# Remove the default Nginx config to avoid conflicts
RUN rm /etc/nginx/conf.d/default.conf

# Copy the custom nginx configuration to the main conf directory
# This placement should avoid envsubst processing
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the built application files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Set correct permissions and ownership for Nginx user
RUN chown -R nginx:nginx /usr/share/nginx/html
RUN chmod -R 755 /usr/share/nginx/html

# Expose port 80 (default Nginx port)
EXPOSE 80