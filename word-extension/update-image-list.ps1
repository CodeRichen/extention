# powershell -ExecutionPolicy Bypass -File "%~dp0update-image-list.ps1"
# Run this script to scan image folders and update image-list.json

Write-Host "Scanning image folders..." -ForegroundColor Cyan

# Get script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path

# Scan miku folder
$mikuPath = Join-Path $scriptPath "miku"
if (Test-Path $mikuPath) {
    $mikuImages = Get-ChildItem $mikuPath -Filter "*.jpg" | Select-Object -ExpandProperty Name | Sort-Object
    Write-Host "Found $($mikuImages.Count) miku images" -ForegroundColor Green
} else {
    $mikuImages = @()
    Write-Host "Warning: miku folder not found" -ForegroundColor Yellow
}

# Scan pho folder
$phoPath = Join-Path $scriptPath "pho"
if (Test-Path $phoPath) {
    $phoImages = Get-ChildItem $phoPath -Filter "*.png" | Select-Object -ExpandProperty Name | Sort-Object
    Write-Host "Found $($phoImages.Count) pho images" -ForegroundColor Green
} else {
    $phoImages = @()
    Write-Host "Warning: pho folder not found" -ForegroundColor Yellow
}

# Scan beauty folder
$beautyPath = Join-Path $scriptPath "beauty"
if (Test-Path $beautyPath) {
    $beautyImages = Get-ChildItem $beautyPath -Filter "*.jpg" | Select-Object -ExpandProperty Name | Sort-Object
    Write-Host "Found $($beautyImages.Count) beauty images" -ForegroundColor Green
} else {
    $beautyImages = @()
    Write-Host "Warning: beauty folder not found" -ForegroundColor Yellow
}

# Create JSON object
$imageList = [PSCustomObject]@{
    miku = [PSCustomObject]@{
        images = $mikuImages
    }
    pho = [PSCustomObject]@{
        images = $phoImages
    }
    beauty = [PSCustomObject]@{
        images = $beautyImages
    }
}

# Convert to JSON and save
$jsonPath = Join-Path $scriptPath "image-list.json"
$imageList | ConvertTo-Json -Depth 10 -Compress | Set-Content $jsonPath -Encoding UTF8

Write-Host ""
Write-Host "Successfully updated image-list.json!" -ForegroundColor Green
Write-Host "Total: miku($($mikuImages.Count)) + pho($($phoImages.Count)) + beauty($($beautyImages.Count)) = $($mikuImages.Count + $phoImages.Count + $beautyImages.Count) images" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to close..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
