# 🐳 Docker Deployment Guide

This guide covers everything you need to know about deploying the CPAP Maintenance Tracker using Docker.

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Prerequisites](#-prerequisites)
- [Environment Setup](#-environment-setup)
- [Deployment Options](#-deployment-options)
- [Configuration](#-configuration)
- [Troubleshooting](#-troubleshooting)
- [Advanced Usage](#-advanced-usage)

## 🚀 Quick Start

### Using Docker Run
```bash
docker run -d \
  --name cpap-tracker \
  -p 8080:80 \
  -e VITE_SUPABASE_URL=https://your-project.supabase.co \
  -e VITE_SUPABASE_ANON_KEY=your-anon-key \
  ghcr.io/dgreviews40-ctrl/cpap-tracker:latest
```

### Using Docker Compose
```bash
# Clone the repository
git clone https://github.com/dgreviews40-ctrl/CPAP-Maintenance-Tracker.git
cd CPAP-Maintenance-Tracker

# Create environment file
cat > .env <<EOF
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
EOF

# Start the application
docker-compose up -d
```

## 🔧 Prerequisites

### Required
- **Docker** 20.10+ installed
- **Supabase account** and project
- **Internet connection** for image download

### Recommended
- **Docker Compose** 2.0+ for easier management
- **4GB RAM** minimum for smooth operation
- **10GB free disk space** for Docker images

## 🌍 Environment Setup

### 1. Get Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings → API**
4. Copy these values:
   - **Project URL** (e.g., `https://xyz.supabase.co`)
   - **anon public key** (starts with `eyJ...`)

### 2. Set Environment Variables

#### Option A: Environment File (.env)
```bash
# Create .env file
cat > .env <<EOF
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
EOF
```

#### Option B: Docker Run Command
```bash
docker run -d \
  --name cpap-tracker \
  -p 8080:80 \
  -e VITE_SUPABASE_URL=https://your-project.supabase.co \
  -e VITE_SUPABASE_ANON_KEY=your-anon-key \
  ghcr.io/dgreviews40-ctrl/cpap-tracker:latest
```

## 🚀 Deployment Options

### 1. Docker Run (Simple)

```bash
# Basic deployment
docker run -d \
  --name cpap-tracker \
  -p 8080:80 \
  -e VITE_SUPABASE_URL=https://your-project.supabase.co \
  -e VITE_SUPABASE_ANON_KEY=your-anon-key \
  ghcr.io/dgreviews40-ctrl/cpap-tracker:latest

# With custom port
docker run -d \
  --name cpap-tracker \
  -p 3000:80 \
  -e VITE_SUPABASE_URL=https://your-project.supabase.co \
  -e VITE_SUPABASE_ANON_KEY=your-anon-key \
  ghcr.io/dgreviews40-ctrl/cpap-tracker:latest
```

### 2. Docker Compose (Recommended)

```yaml
version: "3.9"

services:
  cpap-tracker:
    image: ghcr.io/dgreviews40-ctrl/cpap-tracker:latest
    container_name: cpap-tracker
    ports:
      - "8080:80"
    environment:
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
    restart: unless-stopped
    labels:
      - "casaos.title=CPAP Maintenance Tracker"
      - "casaos.icon=https://raw.githubusercontent.com/dgreviews40-ctrl/CPAP-Maintenance-Tracker/main/public/favicon.ico"
      - "casaos.webui=http://$$HOSTNAME:8080"
```

### 3. CasaOS Deployment

1. **Open CasaOS interface**
2. **Go to Apps → Install App**
3. **Use Docker Compose configuration**:
   ```yaml
   version: "3.9"
   services:
     cpap-tracker:
       image: ghcr.io/dgreviews40-ctrl/cpap-tracker:latest
       container_name: cpap-tracker
       ports:
         - "8080:80"
       environment:
         - VITE_SUPABASE_URL=https://your-project.supabase.co
         - VITE_SUPABASE_ANON_KEY=your-anon-key
       restart: unless-stopped
   ```

### 4. Portainer Deployment

1. **Open Portainer interface**
2. **Go to Containers → Add container**
3. **Configure**:
   - **Image**: `ghcr.io/dgreviews40-ctrl/cpap-tracker:latest`
   - **Ports**: `8080:80`
   - **Environment Variables**:
     - `VITE_SUPABASE_URL` = Your Supabase URL
     - `VITE_SUPABASE_ANON_KEY` = Your Supabase anon key

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | ✅ | `https://xyz.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | ✅ | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### Port Configuration

| Host Port | Container Port | Description |
|-----------|----------------|-------------|
| `8080` | `80` | Default HTTP port |
| `3000` | `80` | Alternative port |
| `80` | `80` | Standard HTTP port |

### Restart Policies

| Policy | Description | Use Case |
|--------|-------------|----------|
| `unless-stopped` | Restart unless manually stopped | Production |
| `always` | Always restart | Development |
| `no` | Never restart | Testing |

## 🔍 Troubleshooting

### Common Issues

#### 1. Container Won't Start
```bash
# Check container logs
docker logs cpap-tracker

# Check if port is in use
netstat -tulpn | grep :8080

# Check Docker status
docker ps -a
```

#### 2. App Shows Blank Page
```bash
# Verify environment variables
docker exec cpap-tracker env | grep VITE

# Check if Supabase is accessible
curl -I https://your-project.supabase.co
```

#### 3. Database Connection Issues
- Verify Supabase URL is correct
- Check anon key is valid
- Ensure Supabase project is active
- Check internet connectivity

#### 4. Port Already in Use
```bash
# Find process using port
lsof -i :8080

# Kill process (if safe)
sudo kill -9 <PID>

# Or use different port
docker run -d -p 8081:80 ...
```

### Debug Commands

```bash
# Check container status
docker ps -a

# View container logs
docker logs cpap-tracker

# Execute shell in container
docker exec -it cpap-tracker sh

# Check environment variables
docker exec cpap-tracker env

# Test connectivity
docker exec cpap-tracker wget -qO- http://localhost:80
```

## 🔧 Advanced Usage

### Custom Nginx Configuration

```bash
# Create custom nginx config
cat > nginx.conf <<EOF
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

# Run with custom config
docker run -d \
  --name cpap-tracker \
  -p 8080:80 \
  -v $(pwd)/nginx.conf:/etc/nginx/conf.d/default.conf \
  -e VITE_SUPABASE_URL=https://your-project.supabase.co \
  -e VITE_SUPABASE_ANON_KEY=your-anon-key \
  ghcr.io/dgreviews40-ctrl/cpap-tracker:latest
```

### Health Checks

```yaml
version: "3.9"
services:
  cpap-tracker:
    image: ghcr.io/dgreviews40-ctrl/cpap-tracker:latest
    container_name: cpap-tracker
    ports:
      - "8080:80"
    environment:
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:80"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Resource Limits

```yaml
version: "3.9"
services:
  cpap-tracker:
    image: ghcr.io/dgreviews40-ctrl/cpap-tracker:latest
    container_name: cpap-tracker
    ports:
      - "8080:80"
    environment:
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'
```

### Backup and Restore

```bash
# Backup container
docker commit cpap-tracker cpap-tracker-backup

# Save container as image
docker save cpap-tracker-backup | gzip > cpap-tracker-backup.tar.gz

# Restore from backup
docker load < cpap-tracker-backup.tar.gz
```

## 📊 Monitoring

### Container Stats
```bash
# View resource usage
docker stats cpap-tracker

# View container details
docker inspect cpap-tracker
```

### Log Management
```bash
# View logs with timestamps
docker logs -t cpap-tracker

# Follow logs in real-time
docker logs -f cpap-tracker

# Limit log output
docker logs --tail 100 cpap-tracker
```

## 🔄 Updates

### Manual Update
```bash
# Stop current container
docker stop cpap-tracker

# Remove old container
docker rm cpap-tracker

# Pull latest image
docker pull ghcr.io/dgreviews40-ctrl/cpap-tracker:latest

# Start with new image
docker run -d \
  --name cpap-tracker \
  -p 8080:80 \
  -e VITE_SUPABASE_URL=https://your-project.supabase.co \
  -e VITE_SUPABASE_ANON_KEY=your-anon-key \
  ghcr.io/dgreviews40-ctrl/cpap-tracker:latest
```

### Automated Updates
```bash
# Use watchtower for automatic updates
docker run -d \
  --name watchtower \
  -v /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower \
  --interval 3600 \
  cpap-tracker
```

## 📞 Support

If you encounter issues:

1. **Check the logs**: `docker logs cpap-tracker`
2. **Verify environment variables**
3. **Test Supabase connectivity**
4. **Check GitHub Issues**: [Report bugs here](https://github.com/dgreviews40-ctrl/CPAP-Maintenance-Tracker/issues)

---

**Happy Deploying! 🚀**
