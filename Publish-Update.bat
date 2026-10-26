@echo off
chcp 65001 > nul
title Mathe-Champion 5 - Update veröffentlichen
cls
echo ========================================================
echo   Mathe-Champion 5 - Update veroffentlichen
echo ========================================================
echo.
set /p "DESC=Beschreibung des Updates eingeben (oder Enter fuer Standard): "
if "%DESC%"=="" set "DESC=Neues Update mit Verbesserungen und Aufgaben"

echo.
echo Starte Veroeffentlichung...
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\publish.ps1" -Description "%DESC%"
echo.
pause
