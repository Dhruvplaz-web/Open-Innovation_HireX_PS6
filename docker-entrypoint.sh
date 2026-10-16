#!/bin/sh
set -e

echo "=========================================================="
echo "   🚀 Starting SkillBridge Unified Docker Platform        "
echo "=========================================================="

# Support dynamic public port from cloud providers (Render, Railway, etc.)
PUBLIC_PORT="${PORT:-80}"
if [ "$PUBLIC_PORT" != "80" ]; then
    echo "⚙️ Configuring Nginx to listen on cloud PORT: $PUBLIC_PORT"
    sed -i "s/listen 80;/listen ${PUBLIC_PORT};/g" /etc/nginx/nginx.conf
fi

# Ensure backend runs on internal port 8000 for Nginx proxying
export HOST="127.0.0.1"
export PORT="8000"

# Start Nginx in background
nginx

echo "✅ Nginx reverse proxy running on port $PUBLIC_PORT"
echo "✅ Starting FastAPI ML backend on http://127.0.0.1:8000"

# Start FastAPI server in foreground
exec python run_server.py
