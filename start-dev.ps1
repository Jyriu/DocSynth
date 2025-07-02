# Script pour démarrer les serveurs backend et frontend en développement

Write-Host "Démarrage de ComplySummarize AI..." -ForegroundColor Green

# Démarrer le backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; Write-Host 'Démarrage du backend sur http://localhost:4000' -ForegroundColor Yellow; npm run dev"

# Attendre un peu avant de démarrer le frontend
Start-Sleep -Seconds 3

# Démarrer le frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; Write-Host 'Démarrage du frontend sur http://localhost:3000' -ForegroundColor Cyan; npm start"

Write-Host "Les deux serveurs démarrent..." -ForegroundColor Green
Write-Host "Backend: http://localhost:4000" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Assurez-vous que MongoDB et Ollama sont démarrés !" -ForegroundColor Red 