# Quick Start Guide - Run This!

## 🚀 You should have 2 NEW PowerShell windows open:

### Check these windows:

**Window 1** should show:
```
• Packages in scope: api, web
• Running dev in 2 packages
api:dev: 🚀 API server running on http://localhost:3001
web:dev: ▲ Next.js 14.0.4
web:dev: - Local: http://localhost:3002
web:dev: ✓ Ready in X.Xs
```

**Window 2** should show:
```
INFO: Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

---

## ⚠️ If windows are NOT open or show errors:

### Open 2 new PowerShell terminals manually:

**Terminal 1 - API & Frontend:**
```powershell
cd d:\Internship\Stage1
npm run dev
```

**Terminal 2 - Vanna AI:**
```powershell
cd d:\Internship\Stage1\services\vanna
python main.py
```

---

## ✅ After services start (wait 15-20 seconds):

### Test in this terminal:
```powershell
# Test API
curl http://localhost:3001/health

# Test Vanna
curl http://localhost:8000/health

# Test Frontend
curl http://localhost:3002
```

### Open in Browser:
- http://localhost:3002/dashboard
- http://localhost:3002/chat-with-data

---

## 🆘 If services aren't starting:

### Check for errors in the PowerShell windows

**Common issues:**

1. **Port already in use:**
```powershell
# Kill process on port 3001
Get-NetTCPConnection -LocalPort 3001 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

2. **Node modules issue:**
```powershell
cd d:\Internship\Stage1
npm install
```

3. **Python package issue:**
```powershell
cd d:\Internship\Stage1\services\vanna
pip install -r requirements.txt
```

---

## 📊 Current Status:

✅ PostgreSQL - RUNNING  
⚠️ API - Need to start  
⚠️ Frontend - Need to start  
✅ Vanna AI - RUNNING  

**You need to start API & Frontend!**

---

## 🎯 MANUAL START (If automatic didn't work):

Just open a new PowerShell and run:
```powershell
cd d:\Internship\Stage1
npm run dev
```

Keep it open and wait for:
- `🚀 API server running on http://localhost:3001`
- `✓ Ready in X.Xs` (Frontend)

Then try the browser!
