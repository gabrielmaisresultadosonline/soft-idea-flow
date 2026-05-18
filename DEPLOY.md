# Deploy do UniDoc em VPS Ubuntu 24.04 LTS

Guia passo a passo para hospedar este projeto (TanStack Start + Vite) numa VPS rodando Ubuntu Server 24.04 LTS, com Nginx + HTTPS (Let's Encrypt) + PM2.

> Substitua `seudominio.com` pelo seu domínio e `deploy` pelo usuário do servidor.

---

## 1. Preparar o servidor

```bash
# Acesse via SSH
ssh root@SEU_IP

# Atualize o sistema
apt update && apt upgrade -y

# Crie um usuário não-root
adduser deploy
usermod -aG sudo deploy
su - deploy
```

## 2. Instalar Node.js 20 LTS, PM2, Nginx, Git

```bash
# Node.js 20 LTS via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx ufw

# PM2 (gerenciador de processos)
sudo npm install -g pm2

# Firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

## 3. Clonar e buildar o projeto

```bash
cd ~
git clone https://github.com/SEU_USUARIO/unidoc.git
cd unidoc

npm install
npm run build
```

O build do TanStack Start gera os arquivos em `.output/` com um servidor Node em `.output/server/index.mjs`.

## 4. Subir com PM2

```bash
pm2 start .output/server/index.mjs --name unidoc
pm2 save
pm2 startup systemd
# execute o comando que o PM2 imprimir
```

A app passa a rodar em `http://127.0.0.1:3000`.

## 5. Configurar Nginx como reverse proxy

```bash
sudo nano /etc/nginx/sites-available/unidoc
```

Cole:

```nginx
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ative:

```bash
sudo ln -s /etc/nginx/sites-available/unidoc /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

## 6. HTTPS grátis com Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d seudominio.com -d www.seudominio.com
```

Renovação automática já vem configurada via `systemd` timer.

## 7. Deploys futuros

```bash
cd ~/unidoc
git pull
npm install
npm run build
pm2 restart unidoc
```

## Dicas

- **DNS**: aponte um registro A do seu domínio para o IP da VPS antes do passo 6.
- **Logs**: `pm2 logs unidoc`
- **Status**: `pm2 status` / `sudo systemctl status nginx`
- **Variáveis de ambiente**: crie um `.env` na raiz e use `pm2 start .output/server/index.mjs --name unidoc --update-env`.

Pronto — UniDoc no ar 🚀
