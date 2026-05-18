#!/bin/bash

# UniDoc Hostinger VPS Installer
# Targeted for Ubuntu/Debian on Hostinger VPS

set -e

# Configuration
DOMAIN="unidoctelemedicina.com.br"
REPO_URL="https://github.com/gabrielmaisresultadosonline/soft-idea-flow.git"
PROJECT_DIR="soft-idea-flow"

# Colors for output
RED='\033[0-31m'
GREEN='\033[0-32m'
BLUE='\033[0-34m'
NC='\033[0m'

echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}    UniDoc - Hostinger VPS Deployment Script    ${NC}"
echo -e "${BLUE}===============================================${NC}"

# 1. Update and Install Basic Dependencies
echo -e "${GREEN}[1/7] Updating system and installing dependencies...${NC}"
sudo apt-get update
sudo apt-get install -y curl git nginx certbot python3-certbot-nginx ufw

# 2. Install Bun (Modern & Fast Runtime)
if ! command -v bun &> /dev/null; then
    echo -e "${GREEN}[2/7] Installing Bun...${NC}"
    curl -fsSL https://bun.sh/install | bash
    # Source bun manually for this session
    export BUN_INSTALL="$HOME/.bun"
    export PATH="$BUN_INSTALL/bin:$PATH"
else
    echo -e "${BLUE}Bun is already installed.${NC}"
fi

# 3. Clone Repository
echo -e "${GREEN}[3/7] Cloning project from GitHub...${NC}"
if [ -d "$PROJECT_DIR" ]; then
    echo -e "${BLUE}Directory $PROJECT_DIR already exists. Updating...${NC}"
    cd "$PROJECT_DIR"
    git pull
else
    git clone "$REPO_URL"
    cd "$PROJECT_DIR"
fi

# 4. Install Project Dependencies & Build
echo -e "${GREEN}[4/7] Installing app dependencies and building...${NC}"
bun install
# Note: In a real VPS you'd need to set your environment variables (.env) before building
# For now we proceed with the build
bun run build

# 5. Nginx Setup
echo -e "${GREEN}[5/7] Configuring Nginx Reverse Proxy...${NC}"
cat <<EOF | sudo tee /etc/nginx/sites-available/unidoc
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

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

# 6. SSL Configuration
echo -e "${GREEN}[6/7] Setting up SSL with Let's Encrypt...${NC}"
if sudo certbot certificates | grep -q "$DOMAIN"; then
    echo -e "${BLUE}SSL for $DOMAIN already exists.${NC}"
else
    echo -e "${BLUE}Obtaining new SSL certificate...${NC}"
    # This might require user interaction for email/agreement if not run with non-interactive
    sudo certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email || echo -e "${RED}Certbot failed. Check DNS propagation.${NC}"
fi

# 7. Persistence with Systemd
echo -e "${GREEN}[7/7] Setting up Systemd service to keep app running...${NC}"
PROJECT_PATH=$(pwd)
USER_NAME=$(whoami)
BUN_PATH=$(which bun)

cat <<EOF | sudo tee /etc/systemd/system/unidoc.service
[Unit]
Description=UniDoc Application
After=network.target

[Service]
Type=simple
User=$USER_NAME
WorkingDirectory=$PROJECT_PATH
ExecStart=$BUN_PATH run start
Restart=always
Environment=NODE_ENV=production
# Add your Supabase secrets here manually or via .env file
# Environment=SUPABASE_URL=...
# Environment=SUPABASE_SERVICE_ROLE_KEY=...

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable unidoc
sudo systemctl restart unidoc

# Firewall
echo -e "${GREEN}Configuring firewall...${NC}"
sudo ufw allow 'Nginx Full'
sudo ufw allow 22
echo "y" | sudo ufw enable

echo -e "${BLUE}===============================================${NC}"
echo -e "${GREEN}    DEPLOYMENT COMPLETE!    ${NC}"
echo -e "${BLUE}===============================================${NC}"
echo -e "Access your app at: ${GREEN}https://$DOMAIN${NC}"
echo -e "Repository: $REPO_URL"
echo -e "\n${RED}IMPORTANT:${NC} Don't forget to edit /etc/systemd/system/unidoc.service"
echo -e "and add your Supabase Environment Variables to make the database work!"
