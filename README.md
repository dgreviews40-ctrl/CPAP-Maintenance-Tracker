# 🛠️ CPAP Maintenance Tracker

## 🧩 Overview
A web-based application designed to streamline CPAP machine maintenance, part tracking, and inventory management. Built with modern web technologies and integrated with Supabase for authentication and backend services.

## 🧱 Tech Stack
- **Frontend**: React.js (with Tailwind CSS for styling)  
- **Backend**: Supabase (authentication, real‑time data, storage)  
- **Database**: PostgreSQL (UUID‑based user identification)  
- **Authentication**: Supabase Auth (email/password flow)  
- **Deployment**: GitHub Pages / Vercel / Netlify (static) **or** Docker (ARM64 & x86)

## 📁 Key Components
### 1. User Authentication
- **Sign Up / Log In** – powered by Supabase Auth.  
- **Profile Management** – user profiles stored in the `profiles` table (UUID primary key).

### 2. Maintenance Tracking
- **Log Entries** – record service dates, part replacements, and next‑due dates.  
- **Automated Scheduling** – calculates next maintenance based on part frequency (default + custom).  
- **Custom Parts** – define custom CPAP models and parts not in the default catalog.

### 3. Inventory System
- **Part Tracking** – monitor stock levels, set reorder thresholds, and log restocks.  
- **Amazon Integration** – generate Amazon search links for parts using a tracking ID.

### 4. Analytics Dashboard
- **Trends** – visualise maintenance history, part usage, and inventory status.  
- **Reports** – export logs as CSV files for external analysis.

---

## 🐳 Docker Support (ARM64 & x86)

### Why Docker?
- **Portability** – run the app on any machine (Raspberry Pi, Jetson, cloud VM, etc.) without installing Node, Vite, or other build tools.  
- **Consistency** – the same environment is used locally, in CI, and in production.  
- **Lightweight Runtime** – final image is ~30 MB (nginx + compiled static assets).

### What’s Included
- **Multi‑stage `Dockerfile`** – builds the React app with `node:20-slim` and serves it with `nginx:alpine`.  
- **`.dockerignore`** – keeps the build context small.  
- **`docker-compose.yml`** – convenient local development (exposes port 8080, injects Supabase env vars, optional local Supabase stack).  
- **GitHub Actions workflow** – automatically builds a **linux/arm64** image on every push to `main` and pushes it to GitHub Container Registry (GHCR). You can switch to Docker Hub by editing the workflow tags.

### Quick Local Test (on an ARM64 board or any machine)

```bash
# Clone the repo (if you haven't already)
git clone https://github.com/your‑user/CPAP-Maintenance-Tracker.git
cd CPAP-Maintenance-Tracker

# Create a .env file next to docker-compose.yml with your Supabase credentials
cat > .env <<EOF
VITE_SUPABASE_URL=https://your‑project.supabase.co
VITE_SUPABASE_ANON_KEY=your‑anon‑key
EOF

# Build and start the container
docker compose up -d --build   # (or `docker-compose up -d --build`)

# Open a browser and go to:
# http://<your‑device‑ip>:8080
```

### Production Deployment (ARM64)

1. **Push to GitHub** – the CI workflow builds the image and pushes it to `ghcr.io/<your‑org>/cpap-tracker:latest`.  
2. **Run on any ARM64 host**:

   ```bash
   docker run -d \
     -p 80:80 \
     -e VITE_SUPABASE_URL=https://your‑project.supabase.co \
     -e VITE_SUPABASE_ANON_KEY=your‑anon‑key \
     ghcr.io/<your‑org>/cpap-tracker:latest
   ```

   The app will be reachable at `http://<host‑ip>`.

### Switching to Docker Hub (optional)

Edit `.github/workflows/docker.yml`:

```yaml
tags: yourdockerhubuser/cpap-tracker:latest
```

Add a Docker Hub login step (replace the GHCR login with Docker Hub credentials).

---

## ⚙️ Environment Variables

| Variable | Description | Required? |
|----------|-------------|-----------|
| `VITE_SUPABASE_URL` | Supabase project URL (e.g., `https://xyz.supabase.co`) | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Public anon key for client‑side access | ✅ |
| `PORT` (optional) | Port for the container (defaults to `80` in the Dockerfile) | — |
| `NODE_ENV` (optional) | `development` or `production` – influences Vite builds | — |

**Never** commit these values to the repository. Supply them at runtime (Docker `-e` flags, `.env` for `docker‑compose`, or GitHub Actions secrets).

---

## 💻 Local Development (npm)

```bash
# Install dependencies
npm install

# Run the dev server (Vite)
npm run dev          # http://localhost:8080

# Build for production
npm run build

# Preview the production build locally
npm run preview
```

The project uses **React Router** (`src/App.tsx`) and **React Query** for data fetching/caching. All UI components are from the **shadcn/ui** library.

---

## 🤖 CI / CD (GitHub Actions)

- **Workflow**: `.github/workflows/docker.yml`  
- **Triggers**: pushes to `main` and manual dispatch.  
- **Steps**: checkout → set up Buildx → login to GHCR → build multi‑arch image (`linux/arm64` by default) → push.  
- **Cache**: uses registry‑based cache to speed up subsequent builds.  

If you want to run tests or linting in the pipeline, extend the workflow with additional steps:

```yaml
- name: Install dependencies
  run: npm ci

- name: Lint
  run: npm run lint

- name: Run tests
  run: npm test
```

---

## 🛠️ Supabase Setup

1. **Create a Supabase project** and note the `URL` and `anon key`.  
2. **Enable Row‑Level Security (RLS)** on all tables (the project already includes the required policies).  
3. **Tables** (auto‑created by the app):
   - `profiles` – user profile data (`first_name`, `last_name`, `avatar_url`).  
   - `maintenance_entries` – logs of part replacements.  
   - `part_inventory` – stock levels, reorder thresholds, last restock date.  
   - `custom_frequencies` – per‑part override of default maintenance intervals.  
   - `user_machines` – custom machine/part definitions added by the user.  
   - `part_images` – optional custom image URLs for parts.  

All tables have RLS policies that restrict access to the owning user (`auth.uid() = user_id` or `id`). No additional configuration is required unless you add new tables.

---

## 🐞 Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| **App fails to load** (blank page) | Missing Supabase env vars | Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in the environment where the app runs (Docker `-e`, `.env`, or CI). |
| **404 on `/part/:key`** | Part key not found in any machine definition | Verify the part exists in either the default `cpapMachines` data or in `user_machines`. |
| **Inventory quantity never updates** | Query cache not invalidated | The UI uses React Query; after a mutation the code calls `queryClient.invalidateQueries`. If you edited the code, make sure those calls remain. |
| **Docker build hangs** | Network connectivity to npm registry | Docker builds run in a clean environment; ensure the host can reach `registry.npmjs.org`. |
| **GitHub Actions fails to push image** | Missing `write:packages` permission | Add a personal access token with `write:packages` scope as a secret (`GHCR_TOKEN`) and reference it in the workflow, or rely on the default `GITHUB_TOKEN` (which already has the permission for the same repo). |
| **Supabase RLS error** | Policies not enabled on a new table | Run `ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;` and add appropriate policies (the repo already contains the needed ones). |

---

## 🤝 Contributing

1. Fork the repository.  
2. Create a feature branch (`git checkout -b feature/awesome‑thing`).  
3. Make your changes, ensuring the UI stays consistent with the shadcn/ui design system.  
4. Run `npm run lint` and fix any warnings.  
5. Submit a Pull Request – CI will automatically build the Docker image and run lint checks.

---

## 📌 License
MIT License – feel free to modify and extend this project for your needs!

[View the source code on GitHub](https://github.com/dgreviews40-ctrl/CPAP-Maintenance-Tracker.git)