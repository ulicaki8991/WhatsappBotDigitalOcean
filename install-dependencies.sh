#!/bin/bash

echo "Installing system dependencies for Puppeteer..."

# Install Homebrew if not already installed
if ! command -v brew &> /dev/null; then
    echo "Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Install dependencies using Homebrew
brew install chromium

echo "Dependencies installed successfully!" 