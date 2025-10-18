# 🛠️ CPAP Maintenance Tracker

## Overview

The **CPAP Maintenance Tracker** is a comprehensive web application designed to help users efficiently manage and track the maintenance, service history, and parts inventory for their CPAP (Continuous Positive Airway Pressure) machines and associated equipment. This app provides a centralized system to ensure timely part replacement, optimal machine performance, and compliance with recommended maintenance schedules.

The application is built with a modern, responsive interface, providing powerful tools for scheduling, logging, and analyzing maintenance activities.

## ✨ Features

*   **Maintenance Logging:** Record detailed maintenance entries, including machine, specific part model, last service date, and calculated next due date.
*   **Automated Scheduling:** Next maintenance dates are automatically calculated based on default or custom replacement frequencies.
*   **Inventory Management:** Track spare part quantities, set reorder thresholds, and receive alerts when stock is low.
*   **Custom Part Definitions:** Define custom CPAP machines or parts not listed in the default catalog.
*   **Frequency Overrides:** Override default replacement intervals for specific parts using custom frequency settings.
*   **Analytics Dashboard:** Visualize maintenance trends, part usage rates, and inventory status.
*   **Secure Authentication:** User registration and login powered by Supabase Auth.
*   **Data Export:** Download maintenance and inventory logs as CSV files.
*   **Affiliate Integration:** Automatically generate Amazon reorder links for parts using the configured tracking ID.

## 💻 Tech Stack

*   **Frontend:** React (with Vite)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **UI Components:** shadcn/ui
*   **Routing:** React Router
*   **Backend & Database:** Supabase (PostgreSQL)
*   **Authentication:** Supabase Auth

## 🚀 Installation and Setup

Follow these steps to get the application running locally on your machine.

### Prerequisites

You will need the following installed on your system:

*   Node.js (LTS version recommended)
*   npm or yarn
*   Git

### Step 1: Clone the Repository

```bash
git clone [YOUR_REPOSITORY_URL]
cd cpap-maintenance-tracker
```

### Step 2: Install Dependencies

```bash
npm install
# or
yarn install
```

### Step 3: Supabase Setup

The application requires a Supabase project for its backend, database, and authentication.

1.  **Create a Supabase Project:** Go to the [Supabase website](https://supabase.com/) and create a new project.
2.  **Get API Keys:** Navigate to **Project Settings** -> **API**. You will need the following:
    *   `Project URL`
    *   `Anon Public Key`
3.  **Set up Database Schema:** The application relies on specific tables and Row Level Security (RLS) policies. The following tables must be created and configured with RLS:
    *   `profiles`
    *   `user_machines`
    *   `part_inventory`
    *   `maintenance_entries`
    *   `custom_frequencies`
    *   `part_images`
    *   ***Crucially, ensure RLS is enabled for all tables and appropriate policies are defined to restrict data access to the authenticated user.***

### Step 4: Configure Environment Variables

Create a file named `.env.local` in the root directory of the project and add your Supabase credentials and other configuration details:

```
# Supabase Configuration
VITE_SUPABASE_URL="[YOUR_SUPABASE_PROJECT_URL]"
VITE_SUPABASE_ANON_KEY="[YOUR_SUPABASE_ANON_PUBLIC_KEY]"

# Affiliate Tracking (Optional)
# This ID is used to generate Amazon affiliate links for parts.
VITE_AMAZON_TRACKING_ID="dansgadgets06-20"
```

### Step 5: Run the Application

Start the development server:

```bash
npm run dev
# or
yarn dev
```

The application should now be running at `http://localhost:5173` (or another port specified by Vite).

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.