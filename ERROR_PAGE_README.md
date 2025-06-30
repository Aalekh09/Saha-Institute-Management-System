# Saha Institute - Professional Error Page Setup

This setup provides a professional error page that displays when your Spring Boot server is not running. It includes both a Spring Boot integrated error page and a standalone version for web servers.

## Files Created

1. **`src/main/resources/static/error.html`** - Spring Boot error page (served for 5xx errors)
2. **`server-down.html`** - Standalone error page for web servers
3. **`nginx-error-config.conf`** - Nginx configuration
4. **`apache-error-config.conf`** - Apache configuration
5. **`setup-error-page.bat`** - Windows setup script

## Features

- 🎨 **Professional Design**: Modern, responsive design with gradient backgrounds
- 📱 **Mobile Responsive**: Works perfectly on all device sizes
- ⚡ **Auto-Retry**: Automatically attempts to reconnect every 30 seconds
- 🔧 **Interactive Elements**: Click effects and progress indicators
- 📧 **Contact Information**: Direct links to support email
- 🌐 **Cross-Browser Compatible**: Works on all modern browsers

## Quick Setup

### Option 1: Spring Boot Only (Recommended for Development)

The error page is already integrated into your Spring Boot application. When your server is down, users will see a browser default error page. To test:

1. Stop your Spring Boot application
2. Try to access `http://localhost:4455`
3. You'll see the browser's default "Connection refused" page

### Option 2: Web Server + Spring Boot (Recommended for Production)

#### Using Nginx

1. **Install Nginx** (if not already installed)
2. **Update the configuration**:
   ```bash
   # Edit nginx-error-config.conf
   # Replace /path/to/your/project with your actual project path
   # Replace your-domain.com with your actual domain
   ```

3. **Copy configuration**:
   ```bash
   # Windows
   copy nginx-error-config.conf C:\nginx\conf\sites-available\saha-institute
   
   # Linux
   sudo cp nginx-error-config.conf /etc/nginx/sites-available/saha-institute
   ```

4. **Enable the site**:
   ```bash
   # Windows
   # Add the configuration to your main nginx.conf
   
   # Linux
   sudo ln -s /etc/nginx/sites-available/saha-institute /etc/nginx/sites-enabled/
   ```

5. **Restart Nginx**:
   ```bash
   # Windows
   nginx -s reload
   
   # Linux
   sudo systemctl restart nginx
   ```

#### Using Apache

1. **Install Apache** (if not already installed)
2. **Update the configuration**:
   ```bash
   # Edit apache-error-config.conf
   # Replace /path/to/your/project with your actual project path
   # Replace your-domain.com with your actual domain
   ```

3. **Copy configuration**:
   ```bash
   # Windows
   copy apache-error-config.conf C:\apache\conf\sites-available\saha-institute.conf
   
   # Linux
   sudo cp apache-error-config.conf /etc/apache2/sites-available/saha-institute.conf
   ```

4. **Enable the site**:
   ```bash
   # Windows
   # Add the configuration to your main httpd.conf
   
   # Linux
   sudo a2ensite saha-institute.conf
   ```

5. **Restart Apache**:
   ```bash
   # Windows
   httpd -k restart
   
   # Linux
   sudo systemctl restart apache2
   ```

## Testing

### Test the Error Page Locally

1. **Run the setup script**:
   ```bash
   setup-error-page.bat
   ```
   Choose option 4 to test the error page locally.

2. **Manual testing**:
   - Open `server-down.html` in your browser
   - Verify the design and functionality

### Test with Server Down

1. **Stop your Spring Boot application**
2. **Access your domain/IP address**
3. **You should see the professional error page**

## Customization

### Colors and Branding

Edit the CSS variables in the HTML files:

```css
/* Primary colors */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Logo colors */
background: linear-gradient(45deg, #667eea, #764ba2);
```

### Contact Information

Update the contact details in both HTML files:

```html
<a href="mailto:support@sahainstitute.com">support@sahainstitute.com</a>
```

### Auto-Retry Settings

Modify the JavaScript in both HTML files:

```javascript
// Change retry interval (currently 30 seconds)
setInterval(autoRetry, 30000);

// Change max retry attempts (currently 10)
const maxRetries = 10;
```

## Troubleshooting

### Error Page Not Showing

1. **Check web server configuration**:
   - Verify the configuration file is in the correct location
   - Check for syntax errors in the configuration
   - Restart the web server

2. **Check file permissions**:
   - Ensure the error page file is readable by the web server
   - Check file paths are correct

3. **Check browser cache**:
   - Clear browser cache and cookies
   - Try in incognito/private mode

### Spring Boot Integration Issues

1. **Verify error.html location**:
   - File should be in `src/main/resources/static/error.html`
   - Rebuild and restart the application

2. **Check application.properties**:
   - Ensure `server.port=4455` is set correctly
   - Verify context path settings

## Security Considerations

1. **Don't expose sensitive information** in error pages
2. **Use HTTPS** in production
3. **Regularly update** web server configurations
4. **Monitor logs** for potential issues

## Support

For issues or questions:
- Email: support@sahainstitute.com
- Check the application logs for detailed error information
- Verify web server configuration syntax

## License

This error page setup is part of the Saha Institute Management System. 