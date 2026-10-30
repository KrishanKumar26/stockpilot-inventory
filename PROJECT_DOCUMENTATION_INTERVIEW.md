# 📋 StockPilot (ShopAI) - Complete Interview Documentation

**Full Stack Smart Inventory Management System**

---

## 📌 Project Overview

**StockPilot** (ShopAI) ek production-ready, AI-powered inventory management system hai jo small-to-medium businesses ke liye automated reordering, real-time stock tracking, aur role-based admin panel provide karta hai.

### 🎯 Key Highlights
- **Full-Stack MERN Application** with PostgreSQL
- **Dual Database Architecture**: PostgreSQL (transactional data) + MongoDB (activity logs)
- **Role-Based Access Control (RBAC)** with JWT Authentication
- **AI-Powered Reorder Recommendations**
- **Real-Time Inventory Tracking**
- **Automated Purchase Order Pipeline**
- **OTP-Based Verification System**

---

## 🛠️ Tech Stack Breakdown

### **Frontend Technologies**
| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 18.3.1 | UI Framework - Component-based architecture |
| **Vite** | 6.1.1 | Build tool - Fast HMR, modern bundling |
| **Recharts** | 2.15.0 | Data visualization - Charts & analytics |
| **Lucide React** | 1.16.0 | Icon library - Modern SVG icons |
| **Vanilla CSS** | - | Custom design system - No external CSS frameworks |

**Why These Technologies?**
- **React 18**: Modern hooks API, concurrent rendering, better performance
- **Vite**: Lightning-fast development server vs traditional webpack
- **No CSS Framework**: Custom design system for complete control & lighter bundle size

### **Backend Technologies**
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | Latest | Runtime environment |
| **Express.js** | 4.21.2 | Web framework - RESTful API routing |
| **PostgreSQL** | 18.3 | Primary database - ACID transactions |
| **MongoDB** | Latest | Secondary database - Activity logs |
| **JWT** | 9.0.3 | Authentication - Stateless token-based auth |
| **BCrypt.js** | 3.0.3 | Password hashing - Salted encryption |
| **Mongoose** | 8.9.5 | MongoDB ODM - Schema validation |
| **pg** | 8.13.1 | PostgreSQL client - Connection pooling |

**Why These Technologies?**
- **Express**: Minimal, flexible, industry-standard for Node.js APIs
- **PostgreSQL**: ACID compliance for financial & inventory transactions
- **MongoDB**: High-throughput logging without blocking main operations
- **JWT**: Scalable, stateless authentication (no server-side sessions)

---

## 🏗️ System Architecture

### **Database Design: Polyglot Persistence Strategy**

#### **PostgreSQL Tables (Relational Data)**

```sql
1. users
   - Authentication & role management
   - OTP verification tracking
   - Fields: id, name, email, password_hash, role, is_verified, otp_code, otp_expires_at

2. products
   - Core inventory catalog
   - Stock levels & thresholds
   - Fields: id, name, sku, category, price, cost_price, available_stock, 
            min_stock_threshold, reorder_quantity, status

3. purchase_orders
   - Automated reorder pipeline
   - Supplier management
   - Fields: id, po_number, product_id, supplier, quantity, total_cost, 
            status (Sent/In Transit/Delivered), eta_days

4. orders (Sales Orders)
   - Customer order tracking
   - Revenue management
   - Fields: id, order_number, customer_name, total_amount, status

5. order_items
   - Order line items (one-to-many relationship)
   - Product-order association
```

#### **MongoDB Collections (Document Store)**

```javascript
1. logs
   - Activity tracking
   - Security audit trails
   - Alert notifications
   - Fields: action, title, description, category, severity, metadata, timestamp
```

### **Why Dual Database?**
**Interview Answer:**
> "I implemented a polyglot persistence strategy to leverage the strengths of both databases:
> 
> - **PostgreSQL**: Provides ACID transactions critical for inventory updates, financial records, and user authentication. Ensures data consistency when multiple orders deplete the same product stock simultaneously.
> 
> - **MongoDB**: Handles high-velocity activity logs and alerts without blocking transactional operations. It's schema-flexible, perfect for evolving log structures and audit trails."

---

## 🔐 Authentication & Security Features

### **Implementation Details**

#### **1. User Registration Flow**
```javascript
POST /api/auth/register
- Validates password (minimum 8 characters)
- Hashes password with bcrypt (10 salt rounds)
- Generates 6-digit OTP
- Stores OTP with 10-minute expiry
- Returns success (OTP sent via email in production)
```

#### **2. OTP Verification**
```javascript
POST /api/auth/verify-otp
- Checks OTP validity & expiry
- Marks user as verified
- Clears OTP from database
- Issues JWT token (expires in 30 days)
```

#### **3. Login with JWT**
```javascript
POST /api/auth/login
- Validates credentials
- Checks if user is verified
- Generates JWT with user payload (id, email, role)
- Returns token + user info
```

#### **4. Protected Routes Middleware**
```javascript
// authMiddleware.js
verifyToken() → Validates JWT, attaches user to req.user
requireAdmin() → Checks if req.user.role === 'admin'
```

### **Security Features**
- ✅ **Password Hashing**: BCrypt with 10 salt rounds
- ✅ **JWT Tokens**: Stateless, scalable authentication
- ✅ **OTP Verification**: 6-digit codes with 10-min expiry
- ✅ **Role-Based Access**: Admin, Manager, Staff roles
- ✅ **SQL Injection Protection**: Parameterized queries (`$1, $2`)
- ✅ **CORS Configuration**: Controlled cross-origin requests

---

## 📦 Core Features Deep Dive

### **1. Dashboard Analytics**

**API Endpoint:**
```javascript
GET /api/analytics/stats
```

**Calculated Metrics:**
- **Total Inventory Value**: SUM(available_stock × price)
- **Low Stock Alerts**: COUNT(products WHERE available_stock < min_stock_threshold)
- **Average Turnover Rate**: Calculated from sales history
- **Potential Lost Revenue**: Estimates from out-of-stock scenarios

**Frontend Implementation:**
```javascript
// StatCards Component
- Real-time metric cards with gradient backgrounds
- Color-coded indicators (green/yellow/red)
- Animated counters on load
```

### **2. Product Management**

**Features:**
- ✅ **CRUD Operations**: Create, Read, Update products
- ✅ **Search & Filters**: By name, SKU, category, status
- ✅ **Stock Tracking**: Real-time availability updates
- ✅ **Status Badges**: 
  - 🔴 Out of Stock (0 units)
  - 🟡 Low Stock (< threshold)
  - 🟠 Warning (< threshold + 5)
  - 🟢 In Stock (>= threshold)

**API Endpoints:**
```javascript
GET    /api/products          // List all with filters
GET    /api/products/:id      // Get single product
POST   /api/products          // Create new
PUT    /api/products/:id      // Update existing
```

### **3. AI Reorder Recommendations**

**Algorithm Logic:**
```javascript
// Recommendation Engine
1. Identify products WHERE available_stock < min_stock_threshold
2. Calculate urgency score based on:
   - Current stock level
   - Sales velocity (orders per day)
   - Supplier lead time
3. Generate reorder suggestions with:
   - Recommended quantity
   - Estimated cost
   - Urgency level
```

**Frontend Component:**
```javascript
// AIReorderRecommendations.jsx
- Displays low-stock products
- 1-click reorder button
- Creates purchase order automatically
- Updates stock prediction
```

### **4. Automated Reorder Pipeline**

**Workflow:**
```
1. Sent → Purchase order created and sent to supplier
2. In Transit → Order shipped, tracking active
3. Delivered → Stock automatically added to inventory
```

**API Endpoint:**
```javascript
PATCH /api/orders/purchase/:id/status
- Updates PO status
- If status = 'Delivered':
  → Adds quantity to product.available_stock
  → Creates activity log
  → Triggers low-stock re-check
```

### **5. Admin Panel**

**User Management:**
```javascript
GET    /api/admin/users           // List all users
PATCH  /api/admin/users/:id/role  // Change user role
DELETE /api/admin/users/:id       // Remove user
```

**System Health Dashboard:**
```javascript
GET /api/admin/system-health

Returns:
{
  postgresql: {
    status: "connected",
    tables: { products: 6, users: 3, orders: 4 }
  },
  mongodb: {
    status: "connected",
    logs_count: 12
  },
  server: {
    uptime: "2h 34m",
    memory: { heapUsed: "45 MB", rss: "120 MB" }
  }
}
```

---

## 🚀 How to Run & Demo

### **Setup Commands**
```bash
# 1. Install all dependencies
npm run install:all

# 2. Configure environment variables
cd server
cp .env.example .env
# Edit .env with your database credentials

# 3. Create PostgreSQL database
psql postgres -c "CREATE DATABASE stockpilot_db;"

# 4. Seed database with sample data
npm run seed

# 5. Start development servers
npm run dev
```

### **Test Accounts**
```
Admin:   admin@shopai.com   / Password123
Manager: manager@shopai.com / Password123
Staff:   staff@shopai.com   / Password123
```

### **Live URLs**
- Frontend: `http://localhost:5174`
- Backend API: `http://localhost:5002`

---

## 🎤 Interview Questions & Answers

### **1. Why did you choose this tech stack?**

**Answer:**
> "I selected React with Vite for rapid development and modern tooling. Express.js provides a lightweight, flexible API layer. The dual-database approach (PostgreSQL + MongoDB) implements polyglot persistence - PostgreSQL ensures ACID compliance for financial transactions, while MongoDB handles high-velocity logs without blocking critical operations. JWT authentication ensures stateless, scalable auth suitable for microservices architecture."

### **2. How does the automated reorder system work?**

**Answer:**
> "The system monitors product stock levels in real-time. When `available_stock` falls below `min_stock_threshold`, it triggers an AI recommendation algorithm that calculates optimal reorder quantity based on historical sales velocity and supplier lead times. 
>
> Users can approve recommendations with one click, which creates a purchase order in 'Sent' status. The pipeline tracks the order through 'In Transit' and 'Delivered' stages. Upon delivery, the system automatically increments the product stock and logs the replenishment activity in MongoDB."

### **3. How did you implement role-based access control?**

**Answer:**
> "I implemented RBAC using JWT tokens with role payloads. The authentication flow:
> 
> 1. User logs in → Server validates credentials
> 2. JWT issued containing `{ id, email, role }` in payload
> 3. Protected routes use `verifyToken` middleware to decode JWT
> 4. Role-specific routes (like admin panel) use `requireAdmin` middleware
> 5. Frontend conditionally renders UI based on decoded token role
>
> This ensures both API-level and UI-level access control."

### **4. What security measures did you implement?**

**Answer:**
> "Multiple layers of security:
> 
> - **Password Security**: BCrypt hashing with 10 salt rounds, minimum 8-character enforcement
> - **OTP Verification**: 6-digit codes with 10-minute expiry stored in database
> - **SQL Injection Protection**: All queries use parameterized statements (`$1, $2`)
> - **JWT Best Practices**: Tokens expire after 30 days, stored in httpOnly cookies (production)
> - **CORS Configuration**: Whitelisted origins only
> - **Input Validation**: Both client and server-side validation"

### **5. How would you scale this application?**

**Answer:**
> "Several scaling strategies:
> 
> **Horizontal Scaling:**
> - Containerize with Docker, deploy on Kubernetes
> - Load balancer across multiple Node.js instances
> - PostgreSQL read replicas for query distribution
> - MongoDB sharding for log data
> 
> **Caching Layer:**
> - Redis for product catalog caching
> - Reduce database hits for frequently accessed data
> 
> **Microservices:**
> - Split into services: Auth, Inventory, Orders, Analytics
> - Message queue (RabbitMQ/Kafka) for async reorder processing
> 
> **CDN:**
> - Serve static assets via Cloudflare/AWS CloudFront"

### **6. What challenges did you face and how did you solve them?**

**Answer:**
> "**Challenge**: Real-time stock updates across multiple concurrent orders could cause race conditions.
> 
> **Solution**: Implemented PostgreSQL transactions with row-level locking. When an order is placed, the stock decrement query uses `SELECT FOR UPDATE` to lock the row until transaction completes.
> 
> **Challenge**: Activity logs slowing down inventory operations.
> 
> **Solution**: Moved logs to MongoDB with async writes. Critical inventory operations don't wait for log writes to complete, ensuring sub-50ms response times."

### **7. How do you handle error scenarios?**

**Answer:**
> "Implemented comprehensive error handling:
> 
> - **API Level**: Try-catch blocks with specific error messages
> - **Database Errors**: Graceful fallbacks (e.g., MongoDB down → logs disabled but app runs)
> - **Frontend**: Error boundaries to catch React component crashes
> - **User Feedback**: Toast notifications for validation errors
> - **Logging**: All errors logged to MongoDB for debugging
> - **HTTP Status Codes**: Proper 400/401/403/404/500 responses"

### **8. What would you add next?**

**Answer:**
> "**Short-term:**
> - Email notifications for low stock alerts
> - Export reports (CSV/PDF)
> - Advanced analytics dashboard with trend predictions
> 
> **Medium-term:**
> - Mobile app (React Native)
> - Barcode scanning integration
> - Multi-warehouse support
> 
> **Long-term:**
> - Machine learning for demand forecasting
> - Integration with accounting software (QuickBooks)
> - Supplier portal for direct PO acceptance"

---

## 📊 Database Schema Diagram

```
┌─────────────────┐         ┌──────────────────┐
│     users       │         │    products      │
├─────────────────┤         ├──────────────────┤
│ id (PK)         │         │ id (PK)          │
│ email (UNIQUE)  │         │ sku (UNIQUE)     │
│ password_hash   │         │ name             │
│ role            │         │ available_stock  │
│ is_verified     │         │ min_threshold    │
│ otp_code        │         │ reorder_quantity │
└─────────────────┘         └──────────────────┘
                                      │
                                      │ (FK)
                            ┌─────────▼──────────┐
                            │ purchase_orders    │
                            ├────────────────────┤
                            │ id (PK)            │
                            │ product_id (FK)    │
                            │ po_number (UNIQUE) │
                            │ supplier           │
                            │ quantity           │
                            │ status             │
                            └────────────────────┘

┌──────────────┐           ┌───────────────┐
│   orders     │───────────│  order_items  │
├──────────────┤  1:many   ├───────────────┤
│ id (PK)      │           │ id (PK)       │
│ order_number │           │ order_id (FK) │
│ customer     │           │ product_id    │
│ total_amount │           │ quantity      │
└──────────────┘           └───────────────┘

MongoDB (Separate)
┌─────────────────┐
│      logs       │
├─────────────────┤
│ _id (ObjectId)  │
│ action          │
│ title           │
│ description     │
│ severity        │
│ timestamp       │
└─────────────────┘
```

---

## 🔧 API Endpoints Reference

### **Authentication**
```
POST   /api/auth/register        // Create new account
POST   /api/auth/verify-otp      // Verify OTP code
POST   /api/auth/resend-otp      // Resend OTP
POST   /api/auth/login           // User login
```

### **Products**
```
GET    /api/products             // List all products (with filters)
GET    /api/products/:id         // Get single product
POST   /api/products             // Create new product
PUT    /api/products/:id         // Update product
```

### **Orders**
```
GET    /api/orders/purchase      // List purchase orders
PATCH  /api/orders/purchase/:id/status  // Update PO status
GET    /api/orders/sales         // List sales orders
POST   /api/orders/sales         // Create sales order
```

### **Analytics**
```
GET    /api/analytics/stats      // Dashboard metrics
GET    /api/analytics/charts     // Chart data
```

### **Admin (Protected)**
```
GET    /api/admin/users          // List all users
PATCH  /api/admin/users/:id/role // Change user role
DELETE /api/admin/users/:id      // Delete user
GET    /api/admin/system-health  // System diagnostics
PATCH  /api/admin/settings       // Update global settings
```

### **Activity Logs**
```
GET    /api/logs                 // Fetch activity logs (MongoDB)
```

---

## 📁 Project Structure

```
stockpilot_project/
│
├── client/                      # React Frontend
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── AICopilotWidget.jsx
│   │   │   ├── AIReorderRecommendations.jsx
│   │   │   ├── AddProductModal.jsx
│   │   │   ├── AuthModal.jsx
│   │   │   ├── AutomatedReorderPipeline.jsx
│   │   │   ├── ProductTable.jsx
│   │   │   ├── ROICalculator.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── StatCards.jsx
│   │   ├── pages/               # Page-level components
│   │   │   ├── LandingPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── AdminPage.jsx
│   │   │   ├── OrdersPage.jsx
│   │   │   └── LogsPage.jsx
│   │   ├── services/
│   │   │   └── api.js           # API client (axios wrapper)
│   │   ├── App.jsx              # Main app component
│   │   ├── main.jsx             # React entry point
│   │   └── index.css            # Global styles
│   ├── public/
│   │   └── products/            # Product SVG images
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                      # Express Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js            # PostgreSQL connection pool
│   │   │   └── mongo.js         # MongoDB connection
│   │   ├── controllers/         # Business logic
│   │   │   ├── authController.js
│   │   │   ├── productController.js
│   │   │   ├── orderController.js
│   │   │   ├── analyticsController.js
│   │   │   ├── adminController.js
│   │   │   ├── aiController.js
│   │   │   └── logController.js
│   │   ├── middleware/
│   │   │   └── authMiddleware.js  # JWT verification
│   │   ├── models/
│   │   │   ├── schema.sql         # PostgreSQL schema
│   │   │   └── Log.js             # MongoDB Mongoose model
│   │   ├── routes/                # API route definitions
│   │   │   ├── authRoutes.js
│   │   │   ├── productRoutes.js
│   │   │   ├── orderRoutes.js
│   │   │   ├── analyticsRoutes.js
│   │   │   ├── adminRoutes.js
│   │   │   ├── aiRoutes.js
│   │   │   └── logRoutes.js
│   │   ├── scripts/
│   │   │   └── seed.js            # Database seeding script
│   │   └── server.js              # Express app entry point
│   ├── .env                       # Environment variables
│   ├── .env.example               # Environment template
│   └── package.json
│
├── package.json                   # Root package (scripts)
└── README.md                      # Project documentation
```

---

## 💡 Key Learnings & Takeaways

### **Technical Skills Demonstrated**
- ✅ Full-stack JavaScript development (React + Node.js)
- ✅ RESTful API design & implementation
- ✅ Database design (relational & document-based)
- ✅ Authentication & authorization (JWT, RBAC)
- ✅ State management in React
- ✅ Async operations & error handling
- ✅ Git version control
- ✅ Environment configuration & deployment prep

### **Problem-Solving Approach**
- 🎯 Breaking complex features into smaller components
- 🎯 Prioritizing user experience over technical complexity
- 🎯 Writing maintainable, documented code
- 🎯 Implementing security best practices
- 🎯 Optimizing database queries for performance

### **Business Understanding**
- 📈 Real-world inventory management challenges
- 📈 SaaS application monetization strategies
- 📈 Role-based access for team collaboration
- 📈 Data-driven decision making with analytics

---

## 🎯 Demo Flow for Interview

### **1. Landing Page (30 seconds)**
- Show professional hero section
- Highlight real-time metrics
- Explain value proposition

### **2. Authentication (1 minute)**
- Register new user → show OTP verification
- Login with demo account
- Explain security measures

### **3. Dashboard (2 minutes)**
- Walk through metric cards
- Filter products by status/category
- Show real-time stock levels
- Explain status badges logic

### **4. AI Reorder Feature (1.5 minutes)**
- Identify low-stock product
- Click "Reorder Now"
- Show automated PO creation
- Track in pipeline (Sent → In Transit → Delivered)

### **5. Admin Panel (1.5 minutes)**
- Switch to admin account
- Show user management
- Display system health dashboard
- Demonstrate role change functionality

### **6. Activity Logs (30 seconds)**
- Show MongoDB logs
- Explain audit trail importance

### **7. Code Walkthrough (2 minutes)**
- Open key files: `authController.js`, `ProductTable.jsx`
- Explain middleware pattern
- Show database query examples

---

## 🚀 Deployment Considerations

### **Frontend Deployment (Vercel/Netlify)**
```bash
npm run build
# Generates optimized production build in client/dist
```

### **Backend Deployment (Railway/Render)**
```bash
# Set environment variables
PORT=5002
DATABASE_URL=postgresql://...
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
```

### **Database Hosting**
- **PostgreSQL**: Neon, Supabase, AWS RDS
- **MongoDB**: MongoDB Atlas (free tier available)

### **Environment Variables**
```bash
# Production .env
NODE_ENV=production
PORT=5002
PGHOST=<production-host>
PGDATABASE=stockpilot_db
PGUSER=<prod-user>
PGPASSWORD=<prod-password>
MONGO_URI=mongodb+srv://<atlas-connection>
JWT_SECRET=<strong-secret-key>
```

---

## 📞 Contact & Portfolio

**Project Name**: StockPilot (ShopAI)  
**GitHub**: [Your GitHub Repository Link]  
**Live Demo**: [Deployed Application URL]  
**Developer**: Krishan Kumar  
**Tech Stack**: React, Node.js, Express, PostgreSQL, MongoDB  
**Duration**: [Project Timeline]  

---

## ✅ Final Checklist for Interview

- [ ] Project runs without errors locally
- [ ] Sample data seeded in database
- [ ] All test accounts working (admin/manager/staff)
- [ ] Can explain every technology choice
- [ ] Prepared answers for scaling questions
- [ ] Code is clean and well-commented
- [ ] README is up-to-date
- [ ] Deployment strategy planned
- [ ] Portfolio/GitHub link ready to share
- [ ] Practiced demo flow (under 10 minutes)

---

**Good luck with your interview! 🚀**

*This project showcases production-level full-stack development skills, modern best practices, and business domain understanding - exactly what employers look for in a full-stack developer.*
