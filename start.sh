#!/bin/bash

# Log start time
echo "Starting application at $(date)"

# Print basic information
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "Current directory: $(pwd)"

# Check if src directory exists
if [ ! -d "src" ]; then
    echo "WARNING: src directory not found!"
    echo "Current directory contents:"
    ls -la
    echo "Please ensure you're in the correct directory"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ] || [ "$1" == "--reinstall" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the application
echo "Starting application..."
node src/index.js

# If the application exits, log the error
if [ $? -ne 0 ]; then
    echo "Application failed to start!"
    echo "Last 50 lines of log:"
    tail -n 50 nohup.out
    exit 1
fi 