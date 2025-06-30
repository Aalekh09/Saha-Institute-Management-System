@echo off
echo ========================================
echo Saha Institute - Error Page Setup
echo ========================================
echo.

echo This script will help you set up a professional error page
echo that displays when your Spring Boot server is not running.
echo.

echo Available options:
echo 1. Copy error page to web server directory
echo 2. Generate nginx configuration
echo 3. Generate Apache configuration
echo 4. Test error page locally
echo 5. Exit
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" goto copy_files
if "%choice%"=="2" goto nginx_config
if "%choice%"=="3" goto apache_config
if "%choice%"=="4" goto test_page
if "%choice%"=="5" goto exit
goto invalid_choice

:copy_files
echo.
echo Copying error page files...
copy "server-down.html" "C:\inetpub\wwwroot\server-down.html"
if exist "C:\inetpub\wwwroot\server-down.html" (
    echo Successfully copied to C:\inetpub\wwwroot\
) else (
    echo Failed to copy. Please copy manually to your web server directory.
)
goto end

:nginx_config
echo.
echo Generating nginx configuration...
echo Please update the nginx-error-config.conf file with your actual paths.
echo Then copy it to your nginx sites-available directory.
echo.
echo Example commands:
echo copy nginx-error-config.conf C:\nginx\conf\sites-available\saha-institute
echo.
goto end

:apache_config
echo.
echo Generating Apache configuration...
echo Please update the apache-error-config.conf file with your actual paths.
echo Then copy it to your Apache sites-available directory.
echo.
echo Example commands:
echo copy apache-error-config.conf C:\apache\conf\sites-available\saha-institute.conf
echo.
goto end

:test_page
echo.
echo Starting local web server to test error page...
echo Opening server-down.html in your default browser...
start server-down.html
echo.
echo The error page should now open in your browser.
echo.
goto end

:invalid_choice
echo.
echo Invalid choice. Please enter a number between 1 and 5.
echo.
goto end

:end
echo.
echo Setup complete! Here's what you need to do next:
echo.
echo 1. If using nginx:
echo    - Update nginx-error-config.conf with your actual paths
echo    - Copy it to your nginx configuration directory
echo    - Restart nginx
echo.
echo 2. If using Apache:
echo    - Update apache-error-config.conf with your actual paths
echo    - Copy it to your Apache configuration directory
echo    - Restart Apache
echo.
echo 3. For testing:
echo    - Place server-down.html in your web server's document root
echo    - Access it via http://localhost/server-down.html
echo.
echo 4. Spring Boot integration:
echo    - The error.html file is already in your static resources
echo    - It will be served automatically for 5xx errors
echo.
pause

:exit
echo.
echo Thank you for using Saha Institute Error Page Setup!
echo. 