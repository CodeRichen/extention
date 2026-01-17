@echo off
chcp 65001 >nul
echo 正在更新圖片列表...
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0update-image-list.ps1"
