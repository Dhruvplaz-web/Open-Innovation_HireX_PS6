@echo off
echo ==========================================================
echo    📦 Exporting SkillBridge Docker Image to Archive
echo ==========================================================
echo.
echo Saving 'skillbridge:latest' to 'skillbridge_bundle.tar' ...
docker save -o skillbridge_bundle.tar skillbridge:latest
echo.
echo ✅ Export complete! File created: skillbridge_bundle.tar
echo You can share this file via Google Drive, USB, or cloud storage.
echo On any other system with Docker, run:
echo   docker load -i skillbridge_bundle.tar
echo   docker run -d -p 5173:80 -p 8000:8000 skillbridge:latest
echo ==========================================================
pause
