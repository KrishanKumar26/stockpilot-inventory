# StockPilot - Smart Inventory Management System

## 📋 Project Kya Hai?

**StockPilot** ek inventory management system hai jo shops aur small businesses ke liye stock track karta hai aur automatically reorder karne mein madad karta hai.

---

## 🎯 Ye Project Kya Karta Hai?

1. **Products Ko Manage Karna**
   - Products add, edit, delete kar sakte hain
   - Stock levels real-time track hota hai
   - Agar stock kam ho to alert milta hai

2. **Automatic Reorder System**
   - Jab product stock kam hota hai to system automatically suggest karta hai reorder karne ke liye
   - Supplier ko purchase order automatically generate hota hai
   - Order tracking (Sent → In Transit → Delivered)

3. **Dashboard & Analytics**
   - Total inventory value dikhata hai
   - Low stock alerts
   - Sales reports
   - Charts aur graphs

4. **User Management**
   - Login/Register system with OTP verification
   - Different roles: Admin, Manager, Staff
   - Admin panel for user management

5. **Activity Logs**
   - Sabhi actions ka record track hota hai
   - Kis user ne kya kiya, ye sab log mein save hai

---

## 🛠️ Technologies Used

### **Frontend**
- **React** - User interface banane ke liye
- **Vite** - Fast development aur build tool
- **CSS** - Custom styling
- **Recharts** - Charts aur graphs ke liye

### **Backend**
- **Node.js + Express** - Server aur API
- **PostgreSQL** - Main database (products, users, orders)
- **MongoDB** - Activity logs store karne ke liye
- **JWT** - Login authentication
- **BCrypt** - Password security

---

## 📊 Database Structure

### **PostgreSQL Tables**
1. **users** - Login credentials, roles (admin/manager/staff)
2. **products** - Product details, price, stock quantity
3. **purchase_orders** - Supplier orders, delivery tracking
4. **orders** - Customer sales orders
5. **order_items** - Order details (kaunsa product, kitni quantity)

### **MongoDB Collection**
1. **logs** - Sabhi activities ka record (low stock alerts, reorders, etc.)

---

## 🚀 Kaise Chalaye?

```bash
# 1. Dependencies install karo
npm run install:all

# 2. Database setup karo
npm run seed

# 3. Project run karo
npm run dev
```

**URLs:**
- Frontend: http://localhost:5174
- Backend: http://localhost:5002

---

## 🔐 Test Accounts

```
Email: admin@shopai.com
Password: Password123

Email: manager@shopai.com  
Password: Password123

Email: staff@shopai.com
Password: Password123
```

---

## ✨ Main Features

✅ Product management (add/edit/delete)  
✅ Real-time stock tracking  
✅ Low stock alerts  
✅ AI-powered reorder recommendations  
✅ Automated purchase order generation  
✅ Order tracking pipeline  
✅ Dashboard with analytics  
✅ User authentication (login/register with OTP)  
✅ Role-based access (Admin, Manager, Staff)  
✅ Activity logging  
✅ Admin panel for system management  

---

## 🎤 Interview Ke Liye Key Points

### **1. Project Ka Purpose?**
> "Ye ek inventory management system hai jo small businesses ko help karta hai apna stock manage karne mein. Jab products kam hote hain to automatic alert milta hai aur reorder kar sakte hain."

### **2. Technologies Kyun Use Kiye?**
> "React fast aur modern UI ke liye, Node.js/Express backend API ke liye, PostgreSQL reliable data storage ke liye (transactions safe rehte hain), aur MongoDB fast logging ke liye use kiya."

### **3. Authentication Kaise Kiya?**
> "JWT tokens use kiye for secure login. Password BCrypt se encrypt karke store hota hai. Registration mein OTP verification bhi hai security ke liye."

### **4. Automatic Reorder Kaise Kaam Karta Hai?**
> "System continuously check karta hai ki kaunse products low stock mein hain. Jab stock minimum threshold se neeche jata hai, to recommendation show hota hai. User ek click mein purchase order create kar sakta hai jo supplier ko automatically send hota hai."

### **5. Database Kyun 2 Use Kiye (PostgreSQL + MongoDB)?**
> "PostgreSQL main data ke liye use kiya kyunki ye safe transactions provide karta hai (jaise orders, payments). MongoDB logs ke liye use kiya kyunki ye fast write operations support karta hai aur main operations slow nahi hote."

---

## 📁 Project Structure

```
stockpilot_project/
├── client/          # React frontend
│   └── src/
│       ├── components/    # UI components
│       ├── pages/        # Different pages
│       └── services/     # API calls
│
├── server/          # Node.js backend
    └── src/
        ├── controllers/  # Business logic
        ├── routes/       # API endpoints
        ├── models/       # Database schemas
        └── middleware/   # Authentication checks
```

---

## 🎯 Project Highlights

- **Full Stack Application** - Frontend + Backend + Database
- **Dual Database System** - PostgreSQL aur MongoDB dono
- **Role-Based Access Control** - Admin, Manager, Staff
- **Real-Time Tracking** - Live stock updates
- **Automated Workflows** - Auto reorder suggestions
- **Security** - JWT, BCrypt, OTP verification
- **Professional UI** - Clean, modern design

---

**Developer:** Krishan Kumar  
**Tech Stack:** React, Node.js, Express, PostgreSQL, MongoDB  
**Project Type:** Full Stack Web Application  
**Purpose:** Inventory Management & Automated Reordering System
