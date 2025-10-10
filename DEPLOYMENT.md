# Home Server Deployment Setup Guide

This guide will help you set up automated deployment of your Mora Jai game to your home server using GitHub Actions.

## Prerequisites

1. **Home Server Requirements:**
   - Linux-based server (Ubuntu, CentOS, etc.)
   - Docker and Docker Compose installed
   - SSH access enabled
   - Port 3000 accessible (for the web app)

2. **GitHub Repository:**
   - Admin access to set up secrets
   - Actions enabled

## Setup Steps

### 1. Prepare Your Home Server

```bash
# Install Docker (Ubuntu/Debian)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create deployment directory
sudo mkdir -p /opt/mora-jai-online
sudo chown $USER:$USER /opt/mora-jai-online
```

### 2. Set Up SSH Key Authentication

On your home server:
```bash
# Generate SSH key pair (if you don't have one)
ssh-keygen -t ed25519 -C "github-actions-deploy"

# Add public key to authorized_keys
cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys

# Display private key (copy this for GitHub secrets)
cat ~/.ssh/id_ed25519
```

### 3. Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these **Repository Secrets**:

| Secret Name | Value | Example |
|-------------|-------|---------|
| `HOME_SERVER_HOST` | Your server's IP address | `192.168.1.100` |
| `HOME_SERVER_USER` | SSH username | `ubuntu` or `pi` |
| `HOME_SERVER_SSH_KEY` | Private SSH key content | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `HOME_SERVER_PORT` | SSH port (usually 22) | `22` |

### 4. Network Configuration

#### Option A: Simple Port Forwarding (Router)
- Forward port 3000 from your router to your home server
- Access via: `http://your-public-ip:3000`

#### Option B: Reverse Proxy (Recommended)
Set up nginx as reverse proxy:

```nginx
# /etc/nginx/sites-available/mora-jai
server {
    listen 80;
    server_name your-domain.com;  # or your-public-ip

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Option C: Cloudflare Tunnel (Most Secure)
```bash
# Install cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# Set up tunnel
cloudflared tunnel login
cloudflared tunnel create mora-jai
cloudflared tunnel route dns mora-jai your-domain.com
```

### 5. Test the Deployment

1. Push code to your main branch
2. Check GitHub Actions tab for workflow progress
3. Access your app at your configured URL

### 6. Monitoring and Maintenance

#### Check deployment status:
```bash
# On your home server
docker ps
docker logs mora-jai-frontend
```

#### Manual deployment:
```bash
# If you need to deploy manually
cd /opt/mora-jai-online
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

#### View logs:
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

## Workflow Features

- ✅ **Automatic deployment** on push to main branch
- ✅ **Manual trigger** option via GitHub Actions UI
- ✅ **Health checks** to verify deployment success
- ✅ **Rollback capability** (keeps previous images)
- ✅ **Cleanup** of old Docker images
- ✅ **Zero-downtime deployment**

## Troubleshooting

### Common Issues:

1. **SSH Connection Failed**
   - Check firewall settings
   - Verify SSH key format
   - Ensure user has Docker permissions

2. **Container Won't Start**
   - Check Docker logs: `docker logs mora-jai-frontend`
   - Verify port availability: `netstat -tlnp | grep 3000`

3. **Network Access Issues**
   - Check port forwarding
   - Verify firewall rules
   - Test local access first: `curl http://localhost:3000`

### Security Considerations:

- Use SSH key authentication (never passwords)
- Limit SSH access to specific IPs if possible
- Keep Docker and system updated
- Consider using a VPN for additional security
- Use strong firewall rules

## Port Configuration Management

The application uses environment variables for all port configurations:

### Environment Files:
- `.env` - Default development configuration
- `.env.prod` - Production overrides

### Available Ports:
```bash
MORA_JAI_PORT=3000          # Main application port
MORA_JAI_INTERNAL_PORT=80   # Container internal port
MORA_JAI_API_PORT=3001      # Future API port
MORA_JAI_DB_PORT=5432       # Future database port
```

### Configuration Management Commands:
```bash
# Show current configuration
npm run config:show
npm run config:show:prod

# Validate port configuration
npm run config:validate
npm run config:validate:prod

# Start with validation
npm run config:start
npm run config:start:prod

# Manual port changes
bash scripts/config-manager.sh change-port .env MORA_JAI_PORT 8080
```

### Production Port Override:
To change the production port, update `.env.prod`:
```bash
MORA_JAI_PORT=8080
```

Then restart:
```bash
npm run docker:down:prod
npm run docker:up:prod
```

## Alternative Deployment Methods

If GitHub Actions doesn't work for your setup, consider:

1. **Watchtower** (auto-updates from registry)
2. **Portainer** (Docker management UI)
3. **Simple script** with webhook
4. **Git hooks** for push-to-deploy

Your deployment is now ready! 🚀