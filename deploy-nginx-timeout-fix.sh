#!/bin/bash

# Deploy nginx timeout fix for Sora video generation
# This script updates nginx configuration to handle 5+ minute video generation

set -e

SERVER="deploy@49.13.132.218"
NGINX_CONF_PATH="/etc/nginx/sites-available/pubdev.app"

echo "🚀 Deploying nginx timeout fix for Sora video generation..."
echo ""

# Upload the updated nginx config
echo "📤 Uploading updated nginx configuration..."
scp nginx-config-fixed.conf $SERVER:/tmp/nginx-pubdev.conf

# SSH into server and apply changes
echo "🔧 Applying configuration changes on server..."
ssh $SERVER << 'ENDSSH'
    set -e
    
    echo "  → Backing up current nginx config..."
    sudo cp /etc/nginx/sites-available/pubdev.app /etc/nginx/sites-available/pubdev.app.backup-$(date +%Y%m%d-%H%M%S)
    
    echo "  → Installing new nginx config..."
    sudo mv /tmp/nginx-pubdev.conf /etc/nginx/sites-available/pubdev.app
    
    echo "  → Testing nginx configuration..."
    sudo nginx -t
    
    if [ $? -eq 0 ]; then
        echo "  → Reloading nginx..."
        sudo systemctl reload nginx
        echo "  ✅ Nginx reloaded successfully!"
    else
        echo "  ❌ Nginx config test failed! Restoring backup..."
        sudo cp /etc/nginx/sites-available/pubdev.app.backup-$(date +%Y%m%d-%H%M%S) /etc/nginx/sites-available/pubdev.app
        exit 1
    fi
    
    echo ""
    echo "  → Checking nginx status..."
    sudo systemctl status nginx --no-pager | head -n 10
ENDSSH

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Updated timeouts:"
echo "   - proxy_connect_timeout: 120s → 600s (10 minutes)"
echo "   - proxy_send_timeout: 120s → 600s (10 minutes)"
echo "   - proxy_read_timeout: 120s → 600s (10 minutes)"
echo ""
echo "🎥 This allows Sora video generation to complete (2-5 minutes)"
echo ""

