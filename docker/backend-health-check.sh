#!/bin/sh

# Backend health check script
set -e

# Check if the main process is running
if ! pgrep -f "node.*main.js" > /dev/null; then
    echo "Backend process is not running"
    exit 1
fi

# Check if the health endpoint responds
if ! curl -f -s http://localhost:4000/api/health > /dev/null; then
    echo "Backend health endpoint is not accessible"
    exit 1
fi

# Check if tRPC endpoint is accessible
if ! curl -f -s -I http://localhost:4000/trpc | grep -q "200\|404"; then
    echo "tRPC endpoint is not accessible"
    exit 1
fi

echo "Backend health check passed"
exit 0