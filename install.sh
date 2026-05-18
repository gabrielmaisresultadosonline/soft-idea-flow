#!/bin/bash

# UniDoc Automatic Installer
# Targeted for Ubuntu/Debian servers

set -e

# Colors for output
RED='\033[0-31m'
GREEN='\033[0-32m'
BLUE='\033[0-34m'
NC='\033[0m' # No Color

echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}          UniDoc Automatic Installer           ${NC}"
echo -e "${BLUE}===============================================${NC}"

# 1. Update System
echo -e "${GREEN}[1/6] Updating system packages...${NC}"
sudo apt-get update && sudo apt-get upgrade -y

# 2. Install Dependencies (Node.js, Bun, Nginx, Certbot)
echo -e "${GREEN}[2/6] Installing dependencies...${NC}"
sudo apt-get install -y curl wget git nginx certbot python3-certbot-nginx

# Install Bun if not present
if ! command -v bun &> /dev/null; then
    echo -e "${BLUE}Installing Bun...${NC}"
    curl -fsSL https://bun.sh/install | bash
    export BUN_INSTALL="$HOME/.bun"
    export PATH="$BUN_INSTALL/bin:$PATH"
fi

# 3. Project Setup
echo -e "${GREEN}[3/6] Setting up project...${NC}"
# Assuming the script is run from the project root or we clone it
# For this environment, we just ensure dependencies are installed
bun install

# 4. Nginx Configuration
echo -e "${GREEN}[4/6] Configuring Nginx...${NC}"
read -p "Enter your domain (e.g., app.unidoc.com.br): " DOMAIN

if [ -z "$DOMAIN" ]; then
    echo -e "${RED}Domain is required. Exiting.${NC}"
    exit 1
fi

cat <<EOF | sudo tee /etc/nginx/sites-available/unidoc
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/unidoc /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

# 5. SSL Configuration (Certbot)
echo -e "${GREEN}[5/6] Checking/Installing SSL...${NC}"
if sudo certbot certificates | grep -q "$DOMAIN"; then
    echo -e "${BLUE}SSL certificate for $DOMAIN already exists. Skipping.${NC}"
else
    echo -e "${BLUE}Requesting SSL certificate for $DOMAIN...${NC}"
    sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email admin@$DOMAIN || echo -e "${RED}Certbot failed. Check your DNS settings.${NC}"
fi

# 6. Service Setup (Systemd)
echo -e "${GREEN}[6/6] Setting up auto-start service...${NC}"
PROJECT_PATH=$(pwd)
USER_NAME=$(whoami)

cat <<EOF | sudo tee /etc/systemd/system/unidoc.service
[Unit]
Description=UniDoc Web Application
After=network.target

[Service]
Type=simple
User=$USER_NAME
WorkingDirectory=$PROJECT_PATH
ExecStart=$(which bun) run start
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable unidoc
# Note: Starting the service might fail if the app isn't built yet
# sudo systemctl start unidoc

echo -e "${BLUE}===============================================${NC}"
echo -e "${GREEN}       Installation Completed Successfully!     ${NC}"
echo -e "${BLUE}===============================================${NC}"
echo -e "Your app will be available at: ${GREEN}https://$DOMAIN${NC}"
echo -e "Make sure your domain points to this server's IP."
echo -e "To start the app manually, run: ${BLUE}bun run build && bun run start${NC}"
