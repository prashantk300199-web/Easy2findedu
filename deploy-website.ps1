$env:PASSWORD = 'Ayush@2005'

& "C:\Program Files (x86)\WinSCP\WinSCP.com" /ini=nul /command `
    "open ftp://u959936762:$env:PASSWORD@185.224.139.120/" `
    "cd htdocs" `
    "put -delete C:\Users\ayush\Downloads\Vidhyamarg\Vidhyamarg\easytofindedu-web\dist\* ./" `
    "exit"

Write-Host "Deployment completed!"
