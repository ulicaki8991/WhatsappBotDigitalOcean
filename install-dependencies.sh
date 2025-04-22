#!/bin/bash

echo "Installing system dependencies for Puppeteer..."

# Detect operating system
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS system
    echo "Detected macOS system"
    
    # Install Homebrew if not already installed
    if ! command -v brew &> /dev/null; then
        echo "Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
    
    # Install dependencies using Homebrew
    brew install chromium
    
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux system
    echo "Detected Linux system"
    
    # Update package lists
    echo "Updating package lists..."
    sudo apt-get update
    
    # Install dependencies for Puppeteer
    echo "Installing dependencies..."
    sudo apt-get install -y \
        gconf-service \
        libasound2 \
        libatk1.0-0 \
        libatk-bridge2.0-0 \
        libc6 \
        libcairo2 \
        libcups2 \
        libdbus-1-3 \
        libexpat1 \
        libfontconfig1 \
        libgcc1 \
        libgconf-2-4 \
        libgdk-pixbuf2.0-0 \
        libglib2.0-0 \
        libgtk-3-0 \
        libnspr4 \
        libpango-1.0-0 \
        libpangocairo-1.0-0 \
        libstdc++6 \
        libx11-6 \
        libx11-xcb1 \
        libxcb1 \
        libxcomposite1 \
        libxcursor1 \
        libxdamage1 \
        libxext6 \
        libxfixes3 \
        libxi6 \
        libxrandr2 \
        libxrender1 \
        libxss1 \
        libxtst6 \
        ca-certificates \
        fonts-liberation \
        libappindicator1 \
        libnss3 \
        lsb-release \
        xdg-utils \
        wget \
        chromium-browser
else
    echo "Unsupported operating system: $OSTYPE"
    exit 1
fi

echo "Dependencies installed successfully!" 