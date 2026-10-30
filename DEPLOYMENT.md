# 🚀 Deployment Guide - StockPilot

## Quick Deployment Steps

### 1️⃣ Database Setup (Neon PostgreSQL - Free)

1. Go to [neon.tech](https://neon.tech) and create free account
2. Create new project "stockpilot"
3. Copy connection string (starts with `postgresql://...`)
4. Run schema:
   ```sql
   -- Copy contents from server/src/models/schema.sql and run in Neon SQL Editor
   ```

### 2️⃣ Backend Deployment (Render - Free)

1. Go to [render.com](https://render.com)
2. Create new **Web Service**
3. Connect your GitHub repository
4. Settings:
   - **Name**: stockpilot-backend
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     ```
     NODE_ENV=production
     PORT=5002
     PGHOST=<neon-host>
     PGPORT=5432
     PGDATABASE=<neon-db-name>
     PGUSER=<neon-username>
     PGPASSWORD=<neon-password>
     JWT_SECRET=<generate-random-secret>
     MONGO_URI=<optional-mongodb-atlas-uri>
     ```
5. Click **Create Web Service**
6. Copy deployed URL (e.g., `https://stockpilot-backend.onrender.com`)

### 3️⃣ Frontend Deployment (Vercel - Free)

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**:
     ```
     VITE_API_URL=<your-render-backend-url>
     ```
     Example: `VITE_API_URL=https://stockpilot-backend.onrender.com`
5. Click **Deploy**

### 4️⃣ Seed Database (One-time)

After backend is deployed, run seed script:

```bash
# Option 1: From Render Shell
npm run seed

# Option 2: Locally with production database
cd server
# Update .env with production database credentials
npm run seed
```

---

## 🔧 Alternative Deployment Options

### Backend Alternatives:
- **Railway**: Similar to Render, easy setup
- **Fly.io**: More control, Docker-based
- **Heroku**: Reliable but paid plans

### Frontend Alternatives:
- **Netlify**: Similar to Vercel
- **Cloudflare Pages**: Fast global CDN
- **GitHub Pages**: Free for static sites

### Database Alternatives:
- **Supabase**: PostgreSQL with built-in auth
- **ElephantSQL**: Managed PostgreSQL
- **PlanetScale**: MySQL alternative

---

## ✅ Post-Deployment Checklist

- [ ] Backend is accessible at deployed URL
- [ ] Frontend loads without errors
- [ ] Login works with test accounts
- [ ] Products display correctly
- [ ] Database connection successful
- [ ] Environment variables set correctly
- [ ] CORS configured for frontend domain

---

## 🐛 Common Issues & Fixes

### Issue: CORS Error
**Fix**: Add frontend URL to CORS whitelist in `server/src/server.js`:
```javascript
app.use(cors({
  origin: ['https://your-frontend.vercel.app'],
  credentials: true
}));
```

### Issue: API 404 Errors
**Fix**: Ensure `VITE_API_URL` environment variable is set in Vercel

### Issue: Database Connection Failed
**Fix**: Check PostgreSQL connection string and verify Neon database is active

### Issue: Build Fails
**Fix**: Ensure all dependencies are in `package.json`, not in `devDependencies`

---

## 📞 Support

For deployment help, check:
- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Neon Docs](https://neon.tech/docs)
