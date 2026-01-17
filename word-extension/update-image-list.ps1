# 自動更新圖片列表腳本
# 執行此腳本以掃描圖片資料夾並更新 image-list.json

Write-Host "正在掃描圖片資料夾..." -ForegroundColor Cyan

# 取得腳本所在目錄
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path

# 掃描 miku 資料夾
$mikuPath = Join-Path $scriptPath "miku"
if (Test-Path $mikuPath) {
    $mikuImages = Get-ChildItem $mikuPath -Filter "*.jpg" | Select-Object -ExpandProperty Name | Sort-Object
    Write-Host "找到 $($mikuImages.Count) 個 miku 圖片" -ForegroundColor Green
} else {
    $mikuImages = @()
    Write-Host "警告: miku 資料夾不存在" -ForegroundColor Yellow
}

# 掃描 pho 資料夾
$phoPath = Join-Path $scriptPath "pho"
if (Test-Path $phoPath) {
    $phoImages = Get-ChildItem $phoPath -Filter "*.png" | Select-Object -ExpandProperty Name | Sort-Object
    Write-Host "找到 $($phoImages.Count) 個 pho 圖片" -ForegroundColor Green
} else {
    $phoImages = @()
    Write-Host "警告: pho 資料夾不存在" -ForegroundColor Yellow
}

# 掃描 beauty 資料夾
$beautyPath = Join-Path $scriptPath "beauty"
if (Test-Path $beautyPath) {
    $beautyImages = Get-ChildItem $beautyPath -Filter "*.jpg" | Select-Object -ExpandProperty Name | Sort-Object
    Write-Host "找到 $($beautyImages.Count) 個 beauty 圖片" -ForegroundColor Green
} else {
    $beautyImages = @()
    Write-Host "警告: beauty 資料夾不存在" -ForegroundColor Yellow
}

# 建立 JSON 物件
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

# 轉換為 JSON 並儲存
$jsonPath = Join-Path $scriptPath "image-list.json"
$imageList | ConvertTo-Json -Depth 10 -Compress | Set-Content $jsonPath -Encoding UTF8

Write-Host "`n成功更新 image-list.json!" -ForegroundColor Green
Write-Host "總計: miku($($mikuImages.Count)) + pho($($phoImages.Count)) + beauty($($beautyImages.Count)) = $($mikuImages.Count + $phoImages.Count + $beautyImages.Count) 張圖片" -ForegroundColor Cyan

# 暫停以查看結果
Write-Host "`n按任意鍵關閉..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
