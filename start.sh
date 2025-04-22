#!/bin/bash

echo "========== WhatsApp Connector Startup =========="
echo "Starting at: $(date)"
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Check current directory
echo "Current directory: $(pwd)"
echo "Files in current directory:"
ls -la

# Verify important files exist
echo -n "Checking for index.js: "
if [ -f "src/index.js" ]; then
    echo "FOUND"
else
    echo "NOT FOUND - Critical Error"
    echo "Current directory structure:"
    find . -type f -name "*.js" | sort
    exit 1
fi

echo -n "Checking for messageRouter.js: "
if [ -f "src/routes/messageRouter.js" ]; then
    echo "FOUND"
else
    echo "NOT FOUND - Critical Error"
    exit 1
fi

# Reinstall dependencies if requested
if [ "$1" == "--reinstall" ]; then
    echo "Reinstalling dependencies..."
    rm -rf node_modules
    npm install
elif [ ! -d "node_modules" ]; then
    echo "Installing dependencies (node_modules not found)..."
    npm install
fi

# Start the application
echo "Starting server..."
echo "Server should be available at http://$(hostname -I | awk '{print $1}'):3000"
cd $(pwd) && node src/index.js 