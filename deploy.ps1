# PowerShell deployment script for EasyToFindEdu

$winscp = "C:\Program Files (x86)\WinSCP\WinSCP.com"
$scriptFile = "winscp-deploy.txt"

Write-Host "Deploying to VPS..." -ForegroundColor Green

& $winscp /script=$scriptFile /log=winscp-deploy.log

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Deployment successful!" -ForegroundColor Green
    Write-Host "✓ Visit: https://www.easytofindedu.com" -ForegroundColor Cyan
} else {
    Write-Host "✗ Deployment failed. Check winscp-deploy.log" -ForegroundColor Red
}
