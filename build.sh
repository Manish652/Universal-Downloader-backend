#!/usr/bin/env bash
set -e

echo "🚀 Starting build process (Render-optimized)..."

# Ensure pip is updated
echo "⬆️ Upgrading pip..."
pip3 install --upgrade pip

# Install yt-dlp
echo "📦 Installing yt-dlp..."
pip3 install yt-dlp

# Confirm yt-dlp installation
if ! command -v yt-dlp &> /dev/null; then
    echo "❌ yt-dlp was not found in the environment's PATH after installation!"
    echo "Please ensure yt-dlp is correctly installed and accessible."
    exit 1
else
    echo "✅ yt-dlp installed successfully!"
    yt-dlp --version
fi

echo "🎉 Build process completed successfully!"
