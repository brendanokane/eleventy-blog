#!/bin/bash
# Development server startup script
# Ensures no stale Eleventy processes are running

echo "Checking for running Eleventy processes..."

# Kill any existing Eleventy processes
pkill -f "eleventy.*--serve" 2>/dev/null

# Wait a moment for processes to clean up
sleep 1

# Verify they're gone
if pgrep -f "eleventy.*--serve" > /dev/null; then
    echo "Warning: Some Eleventy processes are still running. Forcing kill..."
    pkill -9 -f "eleventy.*--serve"
    sleep 1
fi

echo "Starting Eleventy dev server..."
npm start
