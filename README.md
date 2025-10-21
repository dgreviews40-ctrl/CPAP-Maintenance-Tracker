# 🛠️ CPAP Maintenance Tracker

[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://github.com/dgreviews40-ctrl/CPAP-Maintenance-Tracker)
[![React](https://img.shields.io/badge/React-18.3.1-blue?logo=react)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green?logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A comprehensive web application for tracking CPAP machine maintenance, managing parts inventory, and scheduling replacements. Built with modern technologies and designed for both individual users and healthcare providers.

## 📸 Screenshots

### Dashboard Overview
The main dashboard provides a comprehensive overview of your CPAP maintenance status, including inventory alerts, upcoming tasks, and machine health scoring.

![Screenshot 2025-10-18 171306 resize](https://github.com/user-attachments/assets/da53a4c7-9875-45fb-a75f-7deaf4ecaa53)


*The dashboard shows inventory reorder alerts, summary statistics (total entries, due soon, overdue tasks), upcoming maintenance items, machine health score, and part type breakdown charts.*

### Maintenance Tracking
The maintenance section allows you to log new maintenance activities and view your complete maintenance history with filtering and sorting options.

![Screenshot 2025-10-18 171352 resize](https://github.com/user-attachments/assets/35b73f1f-16c7-46b2-bf10-e051a79b1965)


*Add new maintenance entries with detailed forms, track maintenance history, and manage upcoming tasks with status indicators and action buttons.*

### Part Inventory Management
Manage your spare parts inventory with real-time stock levels, reorder alerts, and comprehensive part tracking.

![Screenshot 2025-10-18 171422 resize](https://github.com/user-attachments/assets/46e5ed84-b541-4776-984f-3375d32d8b8b)


*Track spare parts for various CPAP machines, monitor stock levels, set reorder thresholds, and get alerts when parts need restocking.*

## ✨ Features

### 🔐 **User Management**
- **Secure Authentication** - Supabase-powered login/signup
- **User Profiles** - Personalized settings and preferences
- **Multi-device Sync** - Access from any device, anywhere

### 🔧 **Maintenance Tracking**
- **Automated Scheduling** - Smart reminders based on part lifecycles
- **Maintenance History** - Complete log of all service activities
- **Custom Parts** - Add support for any CPAP machine or part
- **Maintenance Forms** - Easy-to-use forms for logging activities

### 📦 **Inventory Management**
- **Stock Monitoring** - Track part quantities and usage
- **Reorder Alerts** - Get notified when parts need restocking
- **Amazon Integration** - Direct links to purchase replacement parts
- **Inventory Analytics** - Usage patterns and cost tracking

### 📊 **Analytics & Reporting**
- **Dashboard Overview** - Key metrics and upcoming tasks
- **Usage Analytics** - Part replacement patterns and trends
- **Export Capabilities** - CSV exports for external analysis
- **Health Scoring** - Machine condition assessment

### 🏥 **Supported Machines**
- **ResMed** - AirSense 10/11, AirMini
- **Philips Respironics** - DreamStation, DreamStation 2
- **Breas** - Z2 Auto Travel CPAP
- **Fisher & Paykel** - SleepStyle
- **3B Medical** - Luna II
- **Custom Machines** - Add your own machine definitions

## 🚀 Quick Start

### ⚠️ **Important: Supabase Setup Required**

**Each user needs their own Supabase project** for data privacy and security. You cannot share Supabase credentials between users.

### Step 1: Create Your Supabase Project

1. **Go to [supabase.com](https://supabase.com)**
2. **Sign up for a free account** (no credit card required)
3. **Create a new project**:
   - Choose your organization
   - Enter project name (e.g., "My CPAP Tracker")
   - Set a strong database password
   - Choose a region close to you
4. **Wait for project creation** (takes 1-2 minutes)
5. **Get your credentials**:
   - Go to **Settings → API**
   - Copy **Project URL** (e.g., `https://xyz.supabase.co`)
   - Copy **anon public key** (starts with `eyJ...`)

### Step 2: Deploy the Application

#### Option 1: Docker (Recommended)

```bash
# Pull the latest image
docker pull ghcr.io/dgreviews40-ctrl/cpap-tracker:latest

# Run with YOUR Supabase credentials
docker run -d \
  --name cpap-tracker \
  -p 8080:80 \
  -e VITE_SUPABASE_URL=https://your-project.supabase.co \
  -e VITE_SUPABASE_ANON_KEY=your-anon-key \
  ghcr.io/dgreviews40-ctrl/cpap-tracker:latest
```

### Option 2: Docker Compose

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

### Option 3: CasaOS Deployment

1. **Docker Image**: `ghcr.io/dgreviews40-ctrl/cpap-tracker:latest`
2. **Tag**: `latest`
3. **Port**: `8080:80`
4. **Environment Variables**:
   - `VITE_SUPABASE_URL` = Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase anon key

## 🛠️ Prerequisites

### Required
- **Supabase Account** - [Sign up here](https://supabase.com/)
- **Docker** (for containerized deployment)
- **Modern Web Browser** (Chrome, Firefox, Safari, Edge)

### Optional
- **Node.js 20+** (for local development)
- **pnpm** (for package management)

## 📋 Setup Instructions

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization and enter project details
4. Wait for the project to be created
5. Go to **Settings → API** and copy:
   - **Project URL** (e.g., `https://xyz.supabase.co`)
   - **anon public key** (starts with `eyJ...`)

### 2. Deploy the Application

#### Using Docker (Recommended)
```bash
# Clone the repository
git clone https://github.com/dgreviews40-ctrl/CPAP-Maintenance-Tracker.git
cd CPAP-Maintenance-Tracker

# Create environment file
cat > .env <<EOF
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
EOF

# Start with Docker Compose
docker-compose up -d
```

#### Using CasaOS
1. Open CasaOS interface
2. Go to "Apps" → "Install App"
3. Use the Docker Compose configuration above
4. Set your environment variables
5. Click "Install"

### 3. Access the Application

- **URL**: `http://your-server-ip:8080`
- **First Time**: Create an account using the signup form
- **Login**: Use your credentials to access the dashboard

## 🏗️ Architecture

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **React Query** - Server state management and caching
- **React Router** - Client-side routing

### Backend
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Relational database
- **Row Level Security** - User data isolation
- **Real-time Subscriptions** - Live data updates
- **Authentication** - Secure user management

### Deployment
- **Docker** - Containerized deployment
- **Nginx** - Web server and reverse proxy
- **GitHub Actions** - CI/CD pipeline
- **GitHub Container Registry** - Docker image hosting

## 📊 Database Schema

The application automatically creates these tables in your Supabase project:

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `profiles` | User information | `first_name`, `last_name`, `avatar_url` |
| `maintenance_entries` | Maintenance logs | `machine`, `last_maintenance`, `next_maintenance` |
| `part_inventory` | Stock management | `part_key`, `quantity`, `reorder_threshold` |
| `custom_frequencies` | Custom schedules | `part_key`, `frequency_days` |
| `user_machines` | Custom parts | `machine_label`, `part_type_label`, `part_model_label` |
| `part_images` | Part photos | `part_key`, `image_url` |

## 🔧 Development

### Local Development Setup

```bash
# Clone the repository
git clone https://github.com/dgreviews40-ctrl/CPAP-Maintenance-Tracker.git
cd CPAP-Maintenance-Tracker

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
pnpm dev
```

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm lint         # Run ESLint
```

### Project Structure

```
src/
├── components/          # React components
│   ├── ui/            # shadcn/ui components
│   └── ...            # Feature components
├── hooks/             # Custom React hooks
├── pages/             # Route components
├── utils/             # Utility functions
├── types/             # TypeScript type definitions
└── integrations/      # External service integrations
```

## 🐳 Docker Details

### Multi-Architecture Support
- **linux/amd64** - Intel/AMD processors
- **linux/arm64** - ARM processors (Raspberry Pi, Apple Silicon)

### Image Size
- **Base Image**: `nginx:alpine` (~16MB)
- **Final Image**: ~30MB (includes React app)
- **Startup Time**: < 5 seconds

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | ✅ | - |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | ✅ | - |
| `PORT` | Container port | ❌ | 80 |

## 🔒 Security

### Data Protection
- **Row Level Security (RLS)** - User data isolation
- **JWT Authentication** - Secure token-based auth
- **HTTPS Only** - Encrypted data transmission
- **No Sensitive Data** - Only public keys in environment

### Best Practices
- Never commit environment variables
- Use strong passwords for Supabase
- Regularly update dependencies
- Monitor access logs

## 🐞 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **App won't load** | Check environment variables are set correctly |
| **Login fails** | Verify Supabase URL and anon key |
| **Data not syncing** | Check internet connection and Supabase status |
| **Docker build fails** | Ensure Docker is running and has internet access |
| **Port already in use** | Change port mapping (e.g., `-p 8081:80`) |

### Getting Help

1. **Check the logs**: `docker logs cpap-tracker`
2. **Verify environment**: Ensure all required variables are set
3. **Test Supabase connection**: Visit your Supabase dashboard
4. **Check GitHub Issues**: [Report bugs here](https://github.com/dgreviews40-ctrl/CPAP-Maintenance-Tracker/issues)

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and test thoroughly
4. **Run linting**: `pnpm lint`
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to your fork**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all checks pass

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** - Backend infrastructure
- **shadcn/ui** - Beautiful UI components
- **React Team** - Amazing framework
- **Open Source Community** - For all the great tools

## ❓ Frequently Asked Questions

### **Q: Do I need to create my own Supabase account?**
**A: Yes!** Each user needs their own Supabase project for data privacy and security. You cannot share Supabase credentials between users.

### **Q: Is Supabase free?**
**A: Yes!** Supabase offers a generous free tier:
- **500MB database storage**
- **2GB bandwidth per month**
- **50,000 monthly active users**
- **No credit card required**

### **Q: Can I use someone else's Supabase project?**
**A: No!** This would compromise data security and privacy. Each user must have their own project.

### **Q: What if I don't want to use Supabase?**
**A: The app requires Supabase for:**
- User authentication
- Data storage
- Real-time sync
- Multi-device access

### **Q: Is my data safe with Supabase?**
**A: Yes!** Supabase provides:
- **Row Level Security (RLS)** - Your data is isolated
- **Encrypted connections** - All data is encrypted in transit
- **GDPR compliant** - Meets privacy regulations
- **Backup and recovery** - Your data is backed up

### **Q: Can I export my data?**
**A: Yes!** You can:
- Export data as CSV files from the app
- Access your data directly from Supabase dashboard
- Download your entire database if needed

## 📞 Support

- **Documentation**: [GitHub Wiki](https://github.com/dgreviews40-ctrl/CPAP-Maintenance-Tracker/wiki)
- **Issues**: [GitHub Issues](https://github.com/dgreviews40-ctrl/CPAP-Maintenance-Tracker/issues)
- **Discussions**: [GitHub Discussions](https://github.com/dgreviews40-ctrl/CPAP-Maintenance-Tracker/discussions)

---

**Made with ❤️ for the CPAP community**

[![GitHub stars](https://img.shields.io/github/stars/dgreviews40-ctrl/CPAP-Maintenance-Tracker?style=social)](https://github.com/dgreviews40-ctrl/CPAP-Maintenance-Tracker)
[![GitHub forks](https://img.shields.io/github/forks/dgreviews40-ctrl/CPAP-Maintenance-Tracker?style=social)](https://github.com/dgreviews40-ctrl/CPAP-Maintenance-Tracker)
