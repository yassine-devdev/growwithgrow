#!/bin/sh

# Frontend health check script
set -e

# Check if nginx is running
if ! pgrep nginx > /dev/null; then
    echo "Nginx is not running"
    exit 1
fi

# Check if the main page is accessible
if ! curl -f -s http://localhost/health > /dev/null; then
    echo "Health endpoint is not accessible"
    exit 1
fi

# Check if static assets are being served
if ! curl -f -s -I http://localhost/ | grep -q "200 OK"; then
    echo "Main page is not accessible"
    exit 1
fi

echo "Frontend health check passed"
exit 0