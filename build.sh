#!/usr/bin/env bash
set -e

echo "🚀 Starting build process (Render-optimized)..."

# Ensure pip is updated
echo "⬆️ Upgrading pip..."
pip3 install --upgrade pip

# Install yt-dlp
echo "📦 Installing yt-dlp..."
pip3 install --user yt-dlp

# Add user bin to PATH for the current session (Render's build environment)
export PATH="$HOME/.local/bin:$PATH"

# Confirm yt-dlp installation
if ! command -v yt-dlp &> /dev/null; then
    echo "❌ yt-dlp not found in PATH after installation. Checking user local bin..."
    if [ -f "$HOME/.local/bin/yt-dlp" ]; then
        echo "✅ Found yt-dlp in ~/.local/bin/"
        $HOME/.local/bin/yt-dlp --version
    else
        echo "❌ yt-dlp installation failed or not found!"
        exit 1
    fi
else
    echo "✅ yt-dlp installed successfully!"
    yt-dlp --version
fi

echo "🎉 Build process completed successfully!"
