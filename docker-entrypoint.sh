#!/bin/sh
# Custom entrypoint script for Nginx to handle CPAP Tracker configuration

set -e  # Exit on any error

echo "Starting CPAP Tracker entrypoint script..."

# Remove the default Nginx config that causes conflicts
rm -f /etc/nginx/conf.d/default.conf

# Copy our custom configuration to the correct location
if [ -f /etc/nginx/conf.d/cpap-tracker.conf.template ]; then
    echo "Copying Nginx configuration template..."
    cp /etc/nginx/conf.d/cpap-tracker.conf.template /etc/nginx/conf.d/cpap-tracker.conf
else
    echo "Warning: Nginx configuration template not found at /etc/nginx/conf.d/cpap-tracker.conf.template"
fi

# Ensure the configuration is valid
echo "Testing Nginx configuration..."
if nginx -t; then
    echo "Nginx configuration is valid. Starting Nginx..."
    exec nginx -g 'daemon off;'
else
    echo "ERROR: Nginx configuration is invalid. Exiting..."
    exit 1
fi