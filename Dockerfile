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

# Remove the default Nginx config files to avoid conflicts and envsubst processing
RUN rm -f /etc/nginx/conf.d/default.conf

# Copy the custom nginx server configuration to the conf.d directory
# This will be included by the main nginx.conf
COPY nginx.conf /etc/nginx/conf.d/cpap-tracker.conf

# Copy the built application files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Set correct permissions and ownership for Nginx user
RUN chown -R nginx:nginx /usr/share/nginx/html
RUN chmod -R 755 /usr/share/nginx/html

# Expose port 80 (default Nginx port)
EXPOSE 80