#!/bin/sh
# Custom entrypoint script for Nginx to handle CPAP Tracker configuration

# Remove the default Nginx config that causes envsubst issues
rm -f /etc/nginx/conf.d/default.conf

# Copy our custom configuration to the correct location
# This assumes we've placed our config file in a temporary location during the build
if [ -f /etc/nginx/conf.d/cpap-tracker.conf.template ]; then
    # If it's a template, we might need to process it, but in our case, we'll just copy it
    cp /etc/nginx/conf.d/cpap-tracker.conf.template /etc/nginx/conf.d/cpap-tracker.conf
fi

# Ensure the configuration is valid
nginx -t

# If the configuration is valid, start Nginx
if [ $? -eq 0 ]; then
    echo "Nginx configuration is valid. Starting Nginx..."
    exec nginx -g 'daemon off;'
else
    echo "Nginx configuration is invalid. Exiting..."
    exit 1
fi