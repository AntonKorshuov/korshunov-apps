@echo off
title Mathe-Champion 5 - Installer Build
echo ========================================================
echo  Erstelle Windows-Installer (.exe) fuer Mathe-Champion 5
echo ========================================================
set "PATH=%PATH%;C:\Program Files\nodejs"
cd /d "%~dp0"
call npm.cmd run electron:build
echo.
echo Fertig! Der Installer liegt im Ordner: dist-electron
pause
