# 🚀 Deployment Guide - Production Setup

This comprehensive guide will help you deploy the Flowbit Analytics Dashboard to production.

---

## 📋 Prerequisites

Before deploying, ensure:
- ✅ Application works perfectly locally (all 3 services running)
- ✅ Dashboard displays charts and analytics correctly
- ✅ Chat with Data AI feature responds to natural language queries
- ✅ Database is seeded with test data
- ✅ You have a GitHub repository with your code
- ✅ You have a Groq API key (for AI features)

---

## 🗄️ Step 1: Setup Production Database

### Recommended: Neon (PostgreSQL)

1. **Sign up:** https://neon.tech/
2. **Create a new project:** "Flowbit Analytics"
3. **Copy the connection string** - looks like:
   ```
   postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```
4. **Save this for later** - you'll need it in multiple places

### Alternative Options:
- **Supabase:** https://supabase.com/
- **Railway:** https://railway.app/
- **Render PostgreSQL:** https://render.com/

---

## 🌐 Step 2: Deploy Frontend to Vercel

### 2.1 Prepare Repository

```powershell
# Make sure all changes are committed
cd d:\Internship\Stage1
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2.2 Deploy to Vercel

1. **Go to:** https://vercel.com/
2. **Sign in** with GitHub
3. **Click "Add New Project"**
4. **Import your repository:** `Stage1`
5. **Configure build settings:**
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/web`
   - **Build Command:** `cd ../.. && npm install && npm run build --filter=web`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`

6. **Add Environment Variables:**
   ```
   NEXT_PUBLIC_API_BASE=https://your-app-name.vercel.app/api
   NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
   ```
   ⚠️ **Note:** We'll set up the API as serverless functions, so API_BASE will be the same domain

7. **Click "Deploy"**

8. **Save your deployment URL:** `https://your-app-name.vercel.app`

---

## 🔧 Step 3: Deploy Backend API to Vercel

### Option A: Serverless Functions (Recommended)

1. **Create `apps/api/vercel.json`:**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/index.js"
    }
  ]
}
```

2. **In Vercel dashboard:**
   - Go to your project
   - Settings → Environment Variables
   - Add:
     ```
     DATABASE_URL=<your-neon-connection-string>
     NODE_ENV=production
     VANNA_SERVICE_URL=<your-vanna-url-from-step-4>
     ```

3. **Redeploy** after adding environment variables

### Option B: Railway (Alternative)

1. **Go to:** https://railway.app/
2. **New Project → Deploy from GitHub repo**
3. **Select** `apps/api` directory
4. **Add Environment Variables:**
   ```
   DATABASE_URL=<your-neon-connection-string>
   PORT=3001
   NODE_ENV=production
   VANNA_SERVICE_URL=<your-vanna-url>
   ```
5. **Deploy**
6. **Save the Railway URL** (e.g., `https://your-api.railway.app`)

---

## 🤖 Step 4: Deploy Vanna AI Service

### Recommended: Render

1. **Go to:** https://render.com/
2. **Sign up/Sign in**
3. **New → Web Service**
4. **Connect GitHub repository**
5. **Configure:**
   - **Name:** `flowbit-vanna-ai`
   - **Root Directory:** `services/vanna`
   - **Environment:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`

6. **Add Environment Variables:**
   ```
   DATABASE_URL=<your-neon-connection-string>
   GROQ_API_KEY=<your-groq-api-key>
   VANNA_PORT=8000
   ```

7. **Important Notes:**
   - Ensure your Groq API key is valid (not in `project_*` format)
   - The service uses `llama-3.3-70b-versatile` model by default
   - PostgreSQL connection requires case-sensitive table/column names
   - The service includes comprehensive logging for debugging

7. **Deploy**

8. **Copy the service URL:** `https://flowbit-vanna-ai.onrender.com`

### Alternative: Railway

1. **New Project → Deploy from GitHub**
2. **Select** `services/vanna`
3. **Add Environment Variables** (same as above)
4. **Deploy**

### Alternative: Fly.io

1. **Install Fly CLI:** `powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"`
2. **Navigate to vanna directory:**
   ```powershell
   cd d:\Internship\Stage1\services\vanna
   ```
3. **Deploy:**
   ```powershell
   fly launch
   fly secrets set DATABASE_URL="<your-db-url>"
   fly secrets set GROQ_API_KEY="<your-groq-key>"
   fly deploy
   ```

---

## 🔗 Step 5: Connect All Services

### 5.1 Update Frontend Environment

1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables
2. **Update:**
   ```
   NEXT_PUBLIC_API_BASE=https://your-app-name.vercel.app/api
   ```
   (If API is on Railway, use Railway URL)

3. **Redeploy frontend**

### 5.2 Update Backend Environment

1. **In Vercel/Railway Dashboard** → API Project → Environment Variables
2. **Update:**
   ```
   VANNA_SERVICE_URL=https://flowbit-vanna-ai.onrender.com
   ```

3. **Redeploy backend**

### 5.3 Setup Database Schema

```powershell
# Set production DATABASE_URL temporarily
$env:DATABASE_URL="<your-neon-connection-string>"

# Push schema
cd d:\Internship\Stage1\apps\api
npx prisma db push

# Seed production database
npm run db:seed
```

---

## 🧪 Step 6: Test Production Deployment

### 6.1 Test Frontend
1. Visit: `https://your-app-name.vercel.app/dashboard`
2. Check:
   - [ ] Dashboard loads
   - [ ] Overview cards show data
   - [ ] Charts display correctly
   - [ ] Invoice table loads
   - [ ] No console errors

### 6.2 Test Chat with Data
1. Visit: `https://your-app-name.vercel.app/chat-with-data`
2. Ask: "What are the top 5 vendors by total spend?"
3. Check:
   - [ ] Query is sent
   - [ ] SQL is generated
   - [ ] Results are displayed
   - [ ] No errors

### 6.3 Test API Endpoints

```powershell
# Test health
curl https://your-app-name.vercel.app/api/health

# Test stats
curl https://your-app-name.vercel.app/api/stats

# Test Vanna
curl https://flowbit-vanna-ai.onrender.com/health
```

---

## 🔒 Step 7: Security & Optimization

### 7.1 Update CORS Settings

In `apps/api/src/index.ts`, update CORS to only allow your domain:

```typescript
app.use(cors({
  origin: ['https://your-app-name.vercel.app'],
  credentials: true
}))
```

### 7.2 Environment Variables Checklist

Make sure these are set in production:

**Vercel (Frontend):**
- ✅ `NEXT_PUBLIC_API_BASE`
- ✅ `NEXT_PUBLIC_APP_URL`

**Vercel/Railway (Backend):**
- ✅ `DATABASE_URL`
- ✅ `NODE_ENV=production`
- ✅ `VANNA_SERVICE_URL`

**Render (Vanna):**
- ✅ `DATABASE_URL`
- ✅ `GROQ_API_KEY`
- ✅ `VANNA_PORT`

---

## 📊 Step 8: Monitor & Debug

### View Logs

**Vercel:**
- Dashboard → Deployments → Click deployment → Logs

**Render:**
- Dashboard → Service → Logs tab

**Railway:**
- Dashboard → Service → Deployments → View Logs

### Common Issues

**1. CORS Errors:**
- Check CORS configuration in API
- Verify frontend URL is allowed

**2. Database Connection Errors:**
- Verify DATABASE_URL is correct
- Check database is accessible from hosting platform
- Ensure SSL mode is enabled for Neon: `?sslmode=require`

**3. Vanna AI Not Responding:**
- Check Groq API key is valid
- Verify VANNA_SERVICE_URL is correct in API env vars
- Check Render service logs for errors

**4. 404 Errors:**
- Verify API routes are correct
- Check build succeeded
- Review Vercel deployment logs

---

## 🎉 Step 9: Final Submission

Collect these URLs for submission:

1. **Frontend:** `https://your-app-name.vercel.app`
2. **Dashboard:** `https://your-app-name.vercel.app/dashboard`
3. **Chat with Data:** `https://your-app-name.vercel.app/chat-with-data`
4. **API:** `https://your-app-name.vercel.app/api` (or Railway URL)
5. **Vanna AI:** `https://flowbit-vanna-ai.onrender.com`
6. **GitHub Repo:** `https://github.com/your-username/Stage1`

### Test Everything One Last Time:
- [ ] Dashboard loads and displays data
- [ ] All charts render correctly
- [ ] Invoice table is searchable
- [ ] Chat with Data responds to queries
- [ ] No console errors
- [ ] All API endpoints work
- [ ] Fast loading times

---

## 💰 Cost Estimation

**Free Tier Options:**
- **Vercel:** Free for hobby projects
- **Neon:** 0.5 GB free, 3 GB-month compute
- **Render:** 750 hours/month free (sleeps after inactivity)
- **Railway:** $5 free credit monthly
- **Groq:** Free tier available

**Total Monthly Cost:** $0-5 (depending on usage)

---

## 📞 Support & Resources

- **Vercel Deployment Docs:** https://vercel.com/docs/deployments/overview
- **Render Docs:** https://render.com/docs
- **Railway Docs:** https://docs.railway.app/
- **Neon Docs:** https://neon.tech/docs/introduction
- **Prisma with Neon:** https://www.prisma.io/docs/guides/database/neon

---

## 🎯 Deployment Checklist

### Database Setup
- [ ] Production PostgreSQL database created (Neon/Supabase/Railway)
- [ ] Database credentials secured
- [ ] Database schema pushed (`npx prisma db push`)
- [ ] Production data seeded (`npm run db:seed`)

### Backend API Deployment
- [ ] Backend deployed to Vercel/Railway
- [ ] Environment variables configured:
  - [ ] `DATABASE_URL`
  - [ ] `NODE_ENV=production`
  - [ ] `VANNA_SERVICE_URL`
- [ ] API health endpoint accessible
- [ ] CORS configured for production domains

### Vanna AI Service Deployment
- [ ] Vanna service deployed to Render/Railway
- [ ] Environment variables configured:
  - [ ] `DATABASE_URL`
  - [ ] `GROQ_API_KEY` (valid API key, not project ID)
  - [ ] `VANNA_PORT`
- [ ] Model `llama-3.3-70b-versatile` enabled in Groq console
- [ ] Service health endpoint accessible

### Frontend Deployment
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured:
  - [ ] `NEXT_PUBLIC_API_BASE`
- [ ] Build completed successfully
- [ ] Production URL accessible

### Testing & Verification
- [ ] Dashboard page loads (`/dashboard`)
- [ ] Overview cards display correct metrics
- [ ] Charts render properly (Bar, Line, Pie, Area)
- [ ] Invoice table loads with data
- [ ] Chat with Data page works (`/chat-with-data`)
- [ ] AI queries return formatted results
- [ ] SQL generation works correctly
- [ ] Currency formatting displays properly
- [ ] No console errors in browser
- [ ] All API endpoints respond correctly
- [ ] Mobile responsive design works

### Security & Performance
- [ ] Environment variables secured (not in Git)
- [ ] API keys rotated if exposed
- [ ] Database connection string uses SSL
- [ ] CORS restricted to production domains only
- [ ] Rate limiting considered for API endpoints

---

## 🚨 Important Notes

1. **Groq API Key**: Ensure you're using an actual API key from https://console.groq.com/keys, not a project ID
2. **Case Sensitivity**: PostgreSQL table/column names are case-sensitive - use double quotes: `"Invoice"`, `"invoiceTotal"`
3. **Model Availability**: Verify `llama-3.3-70b-versatile` is enabled in your Groq account
4. **Database SSL**: Production databases usually require SSL connections
5. **Environment Variables**: Never commit `.env` files to Git
6. **CORS**: Update CORS settings in both backend and Vanna service for production domains

---

## 📞 Additional Resources

- **Vercel Deployment**: https://vercel.com/docs/deployments/overview
- **Render Docs**: https://render.com/docs
- **Railway Docs**: https://docs.railway.app/
- **Neon PostgreSQL**: https://neon.tech/docs/introduction
- **Groq Console**: https://console.groq.com/
- **Prisma Deployment**: https://www.prisma.io/docs/guides/deployment

---

**Need help? Check [README.md](./README.md) for troubleshooting tips or [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for API details.**

---

**Estimated Deployment Time:** 1-2 hours

**Good luck with your deployment! 🚀**
