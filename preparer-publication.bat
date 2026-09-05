@echo off
rem Prepare le dossier "publication" a glisser-deposer sur Cloudflare Pages.
rem Ne contient QUE les fichiers publics du site (jamais les guides internes).
cd /d "%~dp0"
rmdir /s /q publication 2>nul
mkdir publication
copy index.html publication\ >nul
copy 404.html publication\ >nul
copy _headers publication\ >nul
xcopy css publication\css\ /e /i /q >nul
xcopy js publication\js\ /e /i /q >nul
xcopy assets publication\assets\ /e /i /q >nul
xcopy fr publication\fr\ /e /i /q >nul
echo.
echo   Dossier "publication" pret.
echo   Ouvrez Cloudflare Pages et glissez-deposez le dossier "publication".
echo.
pause
