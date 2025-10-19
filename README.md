# 🛠️ CPAP Maintenance Tracker

## 🧩 Overview
A web-based application designed to streamline CPAP machine maintenance, part tracking, and inventory management. Built with modern web technologies and integrated with Supabase for authentication and backend services.

## 🧱 Tech Stack
- **Frontend**: React.js (with Tailwind CSS for styling)
- **Backend**: Supabase (for authentication, real-time data, and database)
- **Database**: PostgreSQL (with UUID-based user identification)
- **Authentication**: Supabase Auth (email/password flow)
- **Deployment**: GitHub Pages (for public access) / Vercel/Netlify (for production)

## 📁 Key Components
### 1. **User Authentication**
- **Sign Up/Log In**: Powered by Supabase Auth
- **Profile Management**: User profiles stored in the `profiles` table (UUID-based ID)

### 2. **Maintenance Tracking**
- **Log Entries**: Record service dates, part replacements, and next due dates
- **Automated Scheduling**: Calculates next maintenance based on part frequency
- **Custom Parts**: Define custom CPAP models and parts

### 3. **Inventory System**
- **Part Tracking**: Monitor stock levels and set reorder thresholds
- **Amazon Integration**: Generate Amazon links for parts using a tracking ID

### 4. **Analytics Dashboard**
- **Trends**: Visualize maintenance history and part usage
- **Reports**: Export logs as CSV files

## 🛠️ Setup Instructions
1. **Clone the repo**:
   ```bash
   git clone https://github.com/dgreviews40-ctrl/CPAP-Maintenance-Tracker.git
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Supabase**:
   - Replace environment variables in `.env` with your Supabase project details
   - Set `SUPABASE_URL` and `SUPABASE_ANON_KEY`

4. **Run the app**:
   ```bash
   npm start
   ```

5. **Access the app**:
   - Local development: http://localhost:3000
   - Production: [https://cpap-maintenance-tracker.com](https://cpap-maintenance-tracker.com) (deployed via GitHub Pages)

## 📸 Screenshots (Placeholder Notes)
- **Dashboard View**: Overview of maintenance history and inventory
- **Maintenance Log**: Detailed entry for a specific part replacement
- **Inventory Page**: Stock levels with reorder alerts
- **User Profile**: Profile settings and avatar management

## 📚 Example Workflow
1. **Login**: Use Supabase Auth to create an account
2. **Add Machine**: Define a custom CPAP model and parts
3. **Log Service**: Record a maintenance event with dates and part details
4. **Check Inventory**: Monitor stock levels and generate Amazon links

## 📌 Notes
- **UUIDs**: User IDs are generated via `gen_random_uuid()` in PostgreSQL
- **Data Sync**: Supabase handles real-time sync between frontend and backend
- **Security**: All user data is stored securely in Supabase with role-based access

## 📌 License
MIT License – Feel free to modify and extend this project for your needs!

[View the source code on GitHub](https://github.com/dgreviews40-ctrl/CPAP-Maintenance-Tracker.git)