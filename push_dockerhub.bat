@echo off
set /p DOCKER_USER="Enter your Docker Hub username: "
if "%DOCKER_USER%"=="" (
    echo [ERROR] Username cannot be empty.
    pause
    exit /b 1
)

echo.
echo ==========================================================
echo    🚀 Publishing SkillBridge to Docker Hub
echo ==========================================================
echo 1. Logging into Docker Hub...
docker login

echo.
echo 2. Tagging image as %DOCKER_USER%/skillbridge:latest ...
docker tag skillbridge:latest %DOCKER_USER%/skillbridge:latest

echo.
echo 3. Pushing image to Docker Hub...
docker push %DOCKER_USER%/skillbridge:latest

echo.
echo ==========================================================
echo ✅ SUCCESS! Your shareable Docker link is:
echo https://hub.docker.com/r/%DOCKER_USER%/skillbridge
echo.
echo Anyone on any computer can now run your app with:
echo   docker run -d -p 5173:80 -p 8000:8000 %DOCKER_USER%/skillbridge:latest
echo ==========================================================
pause
