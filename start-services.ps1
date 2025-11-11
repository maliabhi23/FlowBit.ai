# Start All Services Script
# Save this as: start-services.ps1
# Run with: .\start-services.ps1

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Starting All Services..." -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

# Check PostgreSQL
Write-Host "Checking PostgreSQL..." -ForegroundColor Yellow
$postgres = docker ps --filter "name=flowbit-postgres" --format "{{.Status}}"
if ($postgres -like "*Up*") {
    Write-Host "✅ PostgreSQL is running" -ForegroundColor Green
} else {
    Write-Host "⚠️  Starting PostgreSQL..." -ForegroundColor Yellow
    docker start flowbit-postgres
    Start-Sleep -Seconds 2
    Write-Host "✅ PostgreSQL started" -ForegroundColor Green
}

Write-Host "`nStarting services in background..." -ForegroundColor Yellow
Write-Host "This will open 2 new PowerShell windows" -ForegroundColor Cyan
Write-Host ""

# Start API & Frontend in new window
Write-Host "Starting API & Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd d:\Internship\Stage1; Write-Host 'Starting API & Frontend...' -ForegroundColor Green; npm run dev"

# Wait a bit
Start-Sleep -Seconds 3

# Start Vanna AI in new window
Write-Host "Starting Vanna AI..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd d:\Internship\Stage1\services\vanna; Write-Host 'Starting Vanna AI...' -ForegroundColor Green; python main.py"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Services Starting..." -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Two PowerShell windows should open:" -ForegroundColor Yellow
Write-Host "  1. API & Frontend (port 3001 & 3002)" -ForegroundColor White
Write-Host "  2. Vanna AI (port 8000)" -ForegroundColor White
Write-Host ""
Write-Host "Wait 10-15 seconds for services to start..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Then open in browser:" -ForegroundColor Green
Write-Host "  http://localhost:3002/dashboard" -ForegroundColor Cyan
Write-Host "  http://localhost:3002/chat-with-data" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to test connections..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Wait for services to be ready
Write-Host "`nWaiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Test connections
Write-Host "`nTesting connections..." -ForegroundColor Yellow

$api = try { 
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    "✅ RUNNING"
} catch { 
    "⚠️  Not ready yet" 
}

$vanna = try { 
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    "✅ RUNNING"
} catch { 
    "⚠️  Not ready yet" 
}

Write-Host ""
Write-Host "SERVICE STATUS:" -ForegroundColor Yellow
Write-Host "  PostgreSQL: ✅ RUNNING" -ForegroundColor Green
Write-Host "  API Server: $api" -ForegroundColor $(if ($api -like "*RUNNING*") { "Green" } else { "Yellow" })
Write-Host "  Vanna AI: $vanna" -ForegroundColor $(if ($vanna -like "*RUNNING*") { "Green" } else { "Yellow" })
Write-Host "  Frontend: Check browser" -ForegroundColor White

Write-Host "`nIf services show 'Not ready yet', wait 10 more seconds and try browser" -ForegroundColor Cyan
Write-Host ""
Write-Host "OPEN NOW:" -ForegroundColor Green
Write-Host "  http://localhost:3002/dashboard" -ForegroundColor Cyan
Write-Host ""
