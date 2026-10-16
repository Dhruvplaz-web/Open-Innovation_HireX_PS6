# SkillBridge Platform Launcher
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   🚀 Starting SkillBridge (CraftVerse Hackathon Build)   " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# Ensure NODE_OPTIONS does not reference non-existent patches
if ($env:NODE_OPTIONS -and -not (Test-Path ($env:NODE_OPTIONS -replace '^--require\s+', ''))) {
    $env:NODE_OPTIONS = ""
}

# 1. Start Python FastAPI ML Backend in Background
Write-Host "`n[1/2] Starting Python FastAPI Backend on http://127.0.0.1:8000 ..." -ForegroundColor Green
$serverJob = Start-Process -FilePath "python" -ArgumentList "server/run_server.py" -PassThru -NoNewWindow

Start-Sleep -Seconds 2

# 2. Start Vite Frontend Dev Server
Write-Host "`n[2/2] Starting Vite Frontend on http://localhost:5173 ..." -ForegroundColor Green
Write-Host "`n🔥 SkillBridge is live at http://localhost:5173" -ForegroundColor Yellow
Write-Host "📚 API Swagger Docs at http://127.0.0.1:8000/docs" -ForegroundColor Cyan

Set-Location client
npm run dev
