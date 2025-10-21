# 📋 Installation Guide

Complete step-by-step installation guide for the CPAP Maintenance Tracker.

## 🎯 Choose Your Installation Method

| Method | Difficulty | Best For | Time Required |
|--------|------------|----------|---------------|
| [Docker](#-docker-installation) | ⭐ Easy | Most users | 5 minutes |
| [CasaOS](#-casaos-installation) | ⭐ Easy | CasaOS users | 3 minutes |
| [Portainer](#-portainer-installation) | ⭐⭐ Medium | Docker users | 10 minutes |
| [Local Development](#-local-development) | ⭐⭐⭐ Advanced | Developers | 15 minutes |

## 🐳 Docker Installation

### Prerequisites
- Docker installed on your system
- Supabase account and project

### Step 1: Get Supabase Credentials

1. **Go to [Supabase Dashboard](https://supabase.com/dashboard)**
2. **Select your project** (or create a new one)
3. **Navigate to Settings → API**
4. **Copy these values**:
   - **Project URL** (e.g., `https://xyz.supabase.co`)
   - **anon public key** (starts with `eyJ...`)

### Step 2: Run the Container

```bash
# Basic installation
docker run -d \
  --name cpap-tracker \
  -p 8080:80 \
  -e VITE_SUPABASE_URL=https://your-project.supabase.co \
  -e VITE_SUPABASE_ANON_KEY=your-anon-key \
  ghcr.io/dgreviews40-ctrl/cpap-tracker:latest
```

### Step 3: Access the Application

- **Open your browser** and go to `http://localhost:8080`
- **Create an account** using the signup form
- **Start tracking** your CPAP maintenance!

## 🏠 CasaOS Installation

### Prerequisites
- CasaOS running on your system
- Supabase account and project

### Step 1: Get Supabase Credentials

1. **Go to [Supabase Dashboard](https://supabase.com/dashboard)**
2. **Select your project** (or create a new one)
3. **Navigate to Settings → API**
4. **Copy these values**:
   - **Project URL** (e.g., `https://xyz.supabase.co`)
   - **anon public key** (starts with `eyJ...`)

### Step 2: Install via CasaOS

1. **Open CasaOS interface**
2. **Go to Apps → Install App**
3. **Use this configuration**:

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
    labels:
      - "casaos.title=CPAP Maintenance Tracker"
      - "casaos.icon=https://raw.githubusercontent.com/dgreviews40-ctrl/CPAP-Maintenance-Tracker/main/public/favicon.ico"
      - "casaos.webui=http://$$HOSTNAME:8080"
```

4. **Set your environment variables**:
   - `VITE_SUPABASE_URL` = Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase anon key

5. **Click Install**

### Step 3: Access the Application

- **Open your browser** and go to `http://your-casaos-ip:8080`
- **Create an account** using the signup form
- **Start tracking** your CPAP maintenance!

## 🐳 Portainer Installation

### Prerequisites
- Portainer running on your system
- Supabase account and project

### Step 1: Get Supabase Credentials

1. **Go to [Supabase Dashboard](https://supabase.com/dashboard)**
2. **Select your project** (or create a new one)
3. **Navigate to Settings → API**
4. **Copy these values**:
   - **Project URL** (e.g., `https://xyz.supabase.co`)
   - **anon public key** (starts with `eyJ...`)

### Step 2: Create Container in Portainer

1. **Open Portainer interface**
2. **Go to Containers → Add container**
3. **Configure the container**:

| Setting | Value |
|---------|-------|
| **Name** | `cpap-tracker` |
| **Image** | `ghcr.io/dgreviews40-ctrl/cpap-tracker:latest` |
| **Ports** | `8080:80` |
| **Restart Policy** | `Unless stopped` |

4. **Add Environment Variables**:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | Your Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |

5. **Click Deploy the container**

### Step 3: Access the Application

- **Open your browser** and go to `http://your-portainer-ip:8080`
- **Create an account** using the signup form
- **Start tracking** your CPAP maintenance!

## 💻 Local Development

### Prerequisites
- Node.js 20+ installed
- pnpm package manager
- Supabase account and project

### Step 1: Clone the Repository

```bash
git clone https://github.com/dgreviews40-ctrl/CPAP-Maintenance-Tracker.git
cd CPAP-Maintenance-Tracker
```

### Step 2: Install Dependencies

```bash
# Install pnpm if you don't have it
npm install -g pnpm

# Install project dependencies
pnpm install
```

### Step 3: Set Up Environment

```bash
# Create environment file
cp .env.example .env

# Edit .env with your Supabase credentials
nano .env
```

Add your Supabase credentials to `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Step 4: Start Development Server

```bash
# Start development server
pnpm dev

# The app will be available at http://localhost:8080
```

## 🔧 Configuration Options

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

## 🐞 Troubleshooting

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

## 🔒 Security

### Best Practices
- Never commit environment variables
- Use strong passwords for Supabase
- Regularly update dependencies
- Monitor access logs

### Data Protection
- Row Level Security (RLS) enabled
- JWT Authentication
- HTTPS only
- No sensitive data in environment

## 📞 Support

If you encounter issues:

1. **Check the logs**: `docker logs cpap-tracker`
2. **Verify environment variables**
3. **Test Supabase connectivity**
4. **Check GitHub Issues**: [Report bugs here](https://github.com/dgreviews40-ctrl/CPAP-Maintenance-Tracker/issues)

---

**Happy Installing! 🚀**
