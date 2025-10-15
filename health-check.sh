#!/bin/bash

# Health Check Script for pubdev Deployment
# This script checks the health of your production deployment

echo "🏥 pubdev Deployment Health Check"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter for issues
ISSUES=0

# Function to check service
check_service() {
    local service=$1
    local name=$2
    
    if systemctl is-active --quiet $service; then
        echo -e "${GREEN}✓${NC} $name is running"
    else
        echo -e "${RED}✗${NC} $name is NOT running"
        ((ISSUES++))
    fi
}

# Function to check port
check_port() {
    local port=$1
    local name=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Port $port ($name) is open"
    else
        echo -e "${RED}✗${NC} Port $port ($name) is NOT open"
        ((ISSUES++))
    fi
}

# Function to check file
check_file() {
    local file=$1
    local name=$2
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $name exists"
    else
        echo -e "${RED}✗${NC} $name NOT found"
        ((ISSUES++))
    fi
}

# Function to check directory
check_dir() {
    local dir=$1
    local name=$2
    
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓${NC} $name exists"
    else
        echo -e "${RED}✗${NC} $name NOT found"
        ((ISSUES++))
    fi
}

echo "1. System Services"
echo "-------------------"
check_service nginx "Nginx"
check_service ufw "Firewall (UFW)"
echo ""

echo "2. Network Ports"
echo "----------------"
check_port 80 "HTTP"
check_port 443 "HTTPS"
check_port 3000 "Next.js App"
echo ""

echo "3. PM2 Status"
echo "-------------"
if command -v pm2 &> /dev/null; then
    echo -e "${GREEN}✓${NC} PM2 is installed"
    
    if pm2 list | grep -q "pubdev"; then
        STATUS=$(pm2 jlist | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)
        if [ "$STATUS" == "online" ]; then
            echo -e "${GREEN}✓${NC} pubdev app is online"
        else
            echo -e "${RED}✗${NC} pubdev app status: $STATUS"
            ((ISSUES++))
        fi
        
        # Show app info
        pm2 list | grep pubdev
    else
        echo -e "${RED}✗${NC} pubdev app not found in PM2"
        ((ISSUES++))
    fi
else
    echo -e "${RED}✗${NC} PM2 is NOT installed"
    ((ISSUES++))
fi
echo ""

echo "4. Application Files"
echo "--------------------"
APP_DIR="/home/deploy/pubdev"
if [ -d "$APP_DIR" ]; then
    cd "$APP_DIR"
    check_file "$APP_DIR/package.json" "package.json"
    check_file "$APP_DIR/.env.local" ".env.local"
    check_file "$APP_DIR/ecosystem.config.js" "ecosystem.config.js"
    check_file "$APP_DIR/deploy.sh" "deploy.sh"
    check_dir "$APP_DIR/.next" ".next (built app)"
    check_dir "$APP_DIR/node_modules" "node_modules"
else
    echo -e "${RED}✗${NC} Application directory not found: $APP_DIR"
    ((ISSUES++))
fi
echo ""

echo "5. Nginx Configuration"
echo "----------------------"
if [ -f "/etc/nginx/sites-enabled/pubdev" ]; then
    echo -e "${GREEN}✓${NC} Nginx config is enabled"
    
    # Test Nginx config
    if nginx -t 2>&1 | grep -q "successful"; then
        echo -e "${GREEN}✓${NC} Nginx configuration is valid"
    else
        echo -e "${RED}✗${NC} Nginx configuration has errors"
        ((ISSUES++))
    fi
else
    echo -e "${YELLOW}⚠${NC} Nginx config not found in sites-enabled"
fi
echo ""

echo "6. SSL Certificate"
echo "------------------"
if command -v certbot &> /dev/null; then
    echo -e "${GREEN}✓${NC} Certbot is installed"
    
    if certbot certificates 2>&1 | grep -q "VALID"; then
        echo -e "${GREEN}✓${NC} SSL certificate is valid"
        
        # Show expiry date
        EXPIRY=$(certbot certificates 2>&1 | grep "Expiry Date" | head -1)
        if [ ! -z "$EXPIRY" ]; then
            echo "   $EXPIRY"
        fi
    else
        echo -e "${YELLOW}⚠${NC} No valid SSL certificate found"
    fi
else
    echo -e "${YELLOW}⚠${NC} Certbot is NOT installed"
fi
echo ""

echo "7. System Resources"
echo "-------------------"
# CPU Load
LOAD=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}')
echo "CPU Load: $LOAD"

# Memory
MEMORY=$(free -m | awk 'NR==2{printf "Memory: %s/%sMB (%.2f%%)", $3,$2,$3*100/$2 }')
echo "$MEMORY"

# Disk
DISK=$(df -h / | awk 'NR==2{printf "Disk: %s/%s (%s)", $3,$2,$5}')
echo "$DISK"
echo ""

echo "8. Node.js Environment"
echo "----------------------"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} Node.js: $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js is NOT installed"
    ((ISSUES++))
fi

if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    echo -e "${GREEN}✓${NC} pnpm: $PNPM_VERSION"
else
    echo -e "${RED}✗${NC} pnpm is NOT installed"
    ((ISSUES++))
fi
echo ""

echo "9. Recent Errors (Last 10)"
echo "--------------------------"
if [ -f "/home/deploy/pubdev/logs/err.log" ]; then
    ERROR_COUNT=$(tail -n 10 /home/deploy/pubdev/logs/err.log 2>/dev/null | grep -c "Error" || echo "0")
    if [ "$ERROR_COUNT" -gt 0 ]; then
        echo -e "${YELLOW}⚠${NC} Found $ERROR_COUNT error(s) in recent logs"
        echo "Run: tail -n 50 /home/deploy/pubdev/logs/err.log"
    else
        echo -e "${GREEN}✓${NC} No recent errors in application logs"
    fi
else
    echo -e "${YELLOW}⚠${NC} Error log file not found"
fi
echo ""

echo "10. HTTP Response Check"
echo "-----------------------"
if command -v curl &> /dev/null; then
    # Check localhost
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null)
    if [ "$RESPONSE" == "200" ] || [ "$RESPONSE" == "301" ] || [ "$RESPONSE" == "302" ]; then
        echo -e "${GREEN}✓${NC} App responding on localhost:3000 (HTTP $RESPONSE)"
    else
        echo -e "${RED}✗${NC} App not responding on localhost:3000 (HTTP $RESPONSE)"
        ((ISSUES++))
    fi
    
    # Check health endpoint if it exists
    HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health 2>/dev/null)
    if [ "$HEALTH" == "200" ]; then
        echo -e "${GREEN}✓${NC} Health endpoint responding (HTTP $HEALTH)"
    else
        echo -e "${YELLOW}⚠${NC} Health endpoint status: HTTP $HEALTH"
    fi
else
    echo -e "${YELLOW}⚠${NC} curl not installed, skipping HTTP checks"
fi
echo ""

# Summary
echo "=================================="
echo "Summary"
echo "=================================="
if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! Your deployment looks healthy.${NC}"
    exit 0
elif [ $ISSUES -le 3 ]; then
    echo -e "${YELLOW}⚠ Found $ISSUES issue(s). Your deployment might need attention.${NC}"
    exit 1
else
    echo -e "${RED}✗ Found $ISSUES issue(s). Your deployment needs immediate attention!${NC}"
    exit 2
fi

