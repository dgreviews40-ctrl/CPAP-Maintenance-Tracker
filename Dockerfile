# Stage 1: Build the React application
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:alpine

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built application files
COPY --from=builder /app/dist /usr/share/nginx/html

# The default Nginx entrypoint will run envsubst on /etc/nginx/conf.d/default.conf.
# Since we escaped $uri as $$uri in nginx.conf, envsubst will correctly resolve it to $uri.
# We rely on the default ENTRYPOINT and CMD of nginx:alpine.