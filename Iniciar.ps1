# Script PowerShell para iniciar o app Aliria RH
# Clique direito no arquivo > Executar com PowerShell

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   Iniciando Aliria RH" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Ir para o diretório do app
Set-Location "C:\Klissia - RH\rh-app"

Write-Host "Verificando dependências..." -ForegroundColor Yellow
npm install --silent

Write-Host ""
Write-Host "Iniciando servidor de desenvolvimento..." -ForegroundColor Green
Write-Host "Acesse: http://localhost:5173" -ForegroundColor Green
Write-Host ""

npm run dev

Read-Host "Pressione ENTER para fechar"
