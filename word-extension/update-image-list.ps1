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

# Scan deptop.mp4 subfolder: anime
$videoAnime = @()
$videoAnimePath = Join-Path $scriptPath "deptop.mp4\anime"
if (Test-Path $videoAnimePath) {
    $mp4s = Get-ChildItem $videoAnimePath -Filter "*.mp4" | Select-Object -ExpandProperty Name
    $movs = Get-ChildItem $videoAnimePath -Filter "*.mov" | Select-Object -ExpandProperty Name
    $videoAnime = ($mp4s + $movs) | Sort-Object
    Write-Host "Found $($videoAnime.Count) anime videos" -ForegroundColor Green
} else { Write-Host "Warning: deptop.mp4/anime not found" -ForegroundColor Yellow }

# Scan deptop.mp4 subfolder: catgril
$videoCatgril = @()
$videoCatgrilPath = Join-Path $scriptPath "deptop.mp4\catgril"
if (Test-Path $videoCatgrilPath) {
    $mp4s = Get-ChildItem $videoCatgrilPath -Filter "*.mp4" | Select-Object -ExpandProperty Name
    $movs = Get-ChildItem $videoCatgrilPath -Filter "*.mov" | Select-Object -ExpandProperty Name
    $videoCatgril = ($mp4s + $movs) | Sort-Object
    Write-Host "Found $($videoCatgril.Count) catgril videos" -ForegroundColor Green
} else { Write-Host "Warning: deptop.mp4/catgril not found" -ForegroundColor Yellow }

# Scan deptop.mp4 subfolder: miku
$videoMiku = @()
$videoMikuPath = Join-Path $scriptPath "deptop.mp4\miku"
if (Test-Path $videoMikuPath) {
    $mp4s = Get-ChildItem $videoMikuPath -Filter "*.mp4" | Select-Object -ExpandProperty Name
    $movs = Get-ChildItem $videoMikuPath -Filter "*.mov" | Select-Object -ExpandProperty Name
    $videoMiku = ($mp4s + $movs) | Sort-Object
    Write-Host "Found $($videoMiku.Count) miku videos" -ForegroundColor Green
} else { Write-Host "Warning: deptop.mp4/miku not found" -ForegroundColor Yellow }

# Scan deptop.mp4 subfolder: view
$videoView = @()
$videoViewPath = Join-Path $scriptPath "deptop.mp4\view"
if (Test-Path $videoViewPath) {
    $mp4s = Get-ChildItem $videoViewPath -Filter "*.mp4" | Select-Object -ExpandProperty Name
    $movs = Get-ChildItem $videoViewPath -Filter "*.mov" | Select-Object -ExpandProperty Name
    $videoView = ($mp4s + $movs) | Sort-Object
    Write-Host "Found $($videoView.Count) view videos" -ForegroundColor Green
} else { Write-Host "Warning: deptop.mp4/view not found" -ForegroundColor Yellow }

$totalVideos = $videoAnime.Count + $videoCatgril.Count + $videoMiku.Count + $videoView.Count

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
    videos_anime = [PSCustomObject]@{
        videos = $videoAnime
    }
    videos_catgril = [PSCustomObject]@{
        videos = $videoCatgril
    }
    videos_miku = [PSCustomObject]@{
        videos = $videoMiku
    }
    videos_view = [PSCustomObject]@{
        videos = $videoView
    }
}

# Convert to JSON and save
$jsonPath = Join-Path $scriptPath "image-list.json"
$imageList | ConvertTo-Json -Depth 10 -Compress | Set-Content $jsonPath -Encoding UTF8

Write-Host ""
Write-Host "Successfully updated image-list.json!" -ForegroundColor Green
Write-Host "Images: miku($($mikuImages.Count)) + pho($($phoImages.Count)) + beauty($($beautyImages.Count)) = $($mikuImages.Count + $phoImages.Count + $beautyImages.Count)" -ForegroundColor Cyan
Write-Host "Videos: anime($($videoAnime.Count)) + catgril($($videoCatgril.Count)) + miku($($videoMiku.Count)) + view($($videoView.Count)) = $totalVideos" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to close..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
