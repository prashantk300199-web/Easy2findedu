$winscp = "C:\Program Files (x86)\WinSCP\WinSCP.com"
$scriptFile = "deploy-admin.txt"

Write-Host "Deploying Admin Dashboard to Hostinger..." -ForegroundColor Green

& $winscp /script=$scriptFile /log=admin-deploy.log

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Admin Dashboard deployed successfully!" -ForegroundColor Green
    Write-Host "✓ Visit: https://admin.easytofindedu.com" -ForegroundColor Cyan
} else {
    Write-Host "✗ Deployment failed. Check admin-deploy.log" -ForegroundColor Red
}
