#!/usr/bin/env bash

# Update package lists
apt-get update

# Install Python3 and pip3 if not already installed
apt-get install -y python3 python3-pip

# Check if pip3 is installed properly
if ! command -v pip3 &> /dev/null
then
    echo "❌ pip3 could not be installed or found!"
    exit 1
else
    echo "✅ pip3 installed successfully."
fi

# Try installing yt-dlp
echo "📦 Installing yt-dlp..."
pip3 install yt-dlp

# Confirm yt-dlp installation
if ! command -v yt-dlp &> /dev/null
then
    echo "❌ yt-dlp failed to install!"
    exit 1
else
    echo "✅ yt-dlp installed successfully."
    yt-dlp --version
fi
