#!/bin/bash
# Safe start script - kills existing Eleventy processes before starting new one

# Kill any existing Eleventy processes
pkill -f "eleventy --serve" || true
pkill -f "npx @11ty/eleventy" || true

# Wait a moment for processes to die
sleep 1

# Start fresh
npm start
