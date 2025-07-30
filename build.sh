set -e 
echo "Starting build process..."
if [ -f "/etc/debian_version" ] || [ -f "/etc/ubuntu_version" ]; then
    echo "Detected Debian/Ubuntu environment"
    echo "Updating package lists..."
    apt-get update -qq
    echo "Installing Python3 and pip3..."
    apt-get install -y python3 python3-pip python3-venv
else
    echo "Non-Debian environment detected, checking for existing Python..."
fi
if ! command -v pip3 &> /dev/null; then
    echo "pip3 could not be installed or found!"
    exit 1
else
    echo "pip3 is available"
    pip3 --version
fi
echo " Upgrading pip..."
pip3 install --upgrade pip
echo "📦 Installing yt-dlp..."
pip3 install --user yt-dlp
export PATH="$HOME/.local/bin:$PATH"
echo "export PATH=\"\$HOME/.local/bin:\$PATH\"" >> ~/.bashrc
if ! command -v yt-dlp &> /dev/null; then
    echo "yt-dlp not found in PATH, checking alternative locations..."
    if [ -f "$HOME/.local/bin/yt-dlp" ]; then
        echo "✅ Found yt-dlp in ~/.local/bin/"
        $HOME/.local/bin/yt-dlp --version
    else
        echo "yt-dlp installation failed!"
        echo "🔍 Searching for yt-dlp..."
        find / -name "yt-dlp" 2>/dev/null || true
        exit 1
    fi
else
    echo "✅ yt-dlp installed successfully!"
    yt-dlp --version
fi
echo "Build process completed successfully!"
