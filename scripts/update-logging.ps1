# Script to add logger import to API route files
$apiFiles = Get-ChildItem -Path "f:\BIG PROJECTS\HiddenViews\src\app\api" -Recurse -Filter "route.ts"

foreach ($file in $apiFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Skip if logger is already imported
    if ($content -match "from '@/lib/logger'") {
        Write-Host "Skipping $($file.Name) - logger already imported" -ForegroundColor Yellow
        continue
    }
    
    # Skip if no console statements
    if ($content -notmatch "console\.(error|log|warn)") {
        Write-Host "Skipping $($file.Name) - no console statements" -ForegroundColor Gray
        continue
    }
    
    # Add logger import after other imports
    $newContent = $content -replace "(import .+ from .+;)`n`n", "`$1`nimport { logger } from '@/lib/logger';`n`n"
    
    # Replace console.error with logger.error
    $newContent = $newContent -replace "console\.error\('([^']+)',\s*(\w+)\);", "logger.error('`$1', `$2);"
    $newContent = $newContent -replace "console\.error\(`"([^`"]+)`",\s*(\w+)\);", "logger.error(`"`$1`", `$2);"
    
    # Replace console.log with logger.debug for non-production logs
    $newContent = $newContent -replace "console\.log\('([^']+)',", "logger.debug('`$1',"
    $newContent = $newContent -replace "console\.log\(`"([^`"]+)`",", "logger.debug(`"`$1`","
    
    # Save the file
    Set-Content -Path $file.FullName -Value $newContent -NoNewline
    Write-Host "Updated $($file.Name)" -ForegroundColor Green
}

Write-Host "`nDone! Updated API route files." -ForegroundColor Cyan
