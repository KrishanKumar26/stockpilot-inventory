# ShopAI — Smart Inventory Management System & Admin Suite

A modern, production-grade Full Stack Autonomous Inventory Management System featuring a high-converting SaaS Front Page, Role-Based Admin Panel, and full Authentication with OTP verification.

---

## 🌟 Key Capabilities

### 1. 🔐 Complete Authentication & Security
- **Strict Password Rule**: Minimum **8 characters** required (must and should) with client & server-side validation.
- **6-Digit OTP Verification**: Dual verification flow upon registration and password reset.
- **Forgot Password Flow**: Request OTP via email ➔ Verify OTP ➔ Set new password (>= 8 chars).
- **BCrypt & JWT**: Passwords securely hashed with salted bcrypt rounds; authenticated sessions backed by JWT.
- **Pre-configured Demo Accounts**:
  - **Admin**: `admin@shopai.com` (Password: `Password123`)
  - **Manager**: `manager@shopai.com` (Password: `Password123`)
  - **Staff**: `staff@shopai.com` (Password: `Password123`)

### 2. 🌐 Professional SaaS Front Page (Landing Page)
- **High-Converting Hero**: Live glowing badge, gradient typography, real-time KPI counters (`$1.2M+` inventory value, `99.8%` reorder accuracy).
- **Interactive App Mockup**: Embedded preview of the live ShopAI workspace with 1-click launch.
- **Comprehensive Sections**: Core features showcase, Dual-database architecture breakdown, transparent SaaS pricing tiers, and system status footer.

### 3. 🛡️ Role-Based Admin Panel
- **User & Access Management**: View all registered users, dynamically change user roles (`Admin`, `Manager`, `Staff`), delete users, and track OTP verification status.
- **Real-Time Infrastructure Health**:
  - PostgreSQL 17 status and live table record counts.
  - MongoDB 9 document store connection and activity log metrics.
  - Node.js runtime memory heap, RSS, uptime, and latency diagnostics.
- **Global Inventory Policies**: Configure system-wide safety thresholds, default reorder quantities, toggle autonomous AI reorders, and maintenance mode.
- **Security Audit Stream**: Real-time immutable event log tracking all authentication and privilege changes.

### 4. 📦 Core Inventory & Supply Chain Engine (Exact Screenshot Match)
- **Pixel-by-pixel match** of the provided design screenshot:
  - 4 Metric Cards: Total Inventory Value (`$1,234,567`), Low Stock Alerts (`14 items`), Avg. Turnover (`4.2/year`), Potential Lost Revenue (`$12,500`).
  - Search & Filters: Name/SKU search, Category dropdown, and Status filter.
  - Products Table: SVG thumbnails, available units, and colored dot status badges (`Low Stock`, `In Stock`, `Out of Stock`, `Warning`).
  - AI Reorder Recommendations: 1-click reorder dispatching automated POs.
  - Automated Reorder Pipeline: Progression from `Sent` ➔ `In Transit` ➔ `Delivered` (automatically replenishing PostgreSQL stock).

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Vanilla CSS Design System, Recharts, Lucide React
- **Backend**: Node.js, Express.js, REST API, JSON Web Tokens (JWT), BCrypt.js
- **Databases**:
  - **PostgreSQL**: Users (credentials & roles), Products, Purchase Orders, Sales Orders, Order Items
  - **MongoDB**: Activity Logs, Alert Notifications, Security Audit Trails
- **Dev Tools**: `concurrently`, `dotenv`, `nodemon`

---

## 🚀 Quick Setup & Run Instructions

### 1. Start Both Backend & Frontend:
```bash
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5002](http://localhost:5002)

### 2. Seed Databases (Tables, Products, Users, Logs):
```bash
npm run seed
```

---

## 🎯 Interview Talking Points (Full Stack Developer)

| Question | Strong Answer |
| :--- | :--- |
| **How did you enforce the 8-character password & OTP policy?** | *"Client-side inputs enforce `minLength={8}` with live feedback, while the Express controller enforces a strict server-side check before hashing with `bcrypt.hash(password, 10)`. For OTP, a cryptographic 6-digit code with a 10-minute expiry is generated and stored in PostgreSQL, and verified before activating the account or resetting passwords."* |
| **Why did you use both PostgreSQL and MongoDB?** | *"Polyglot Persistence: PostgreSQL provides ACID transactions, relational integrity for stock updates, financial order items, and user accounts. MongoDB provides a high-throughput, non-blocking document store for activity logs, alert streams, and security audit trails."* |
| **How does the Admin Panel work?** | *"Admin routes are protected by a JWT middleware (`verifyToken`) followed by a role checker (`requireAdmin`). Admins have access to real-time system diagnostics, user role elevation, and global threshold policies."* |
