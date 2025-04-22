# WhatsApp Connector Troubleshooting Guide

## Common Issues and Solutions

### 1. 404 Errors on API Endpoints

**Symptoms:**
- Browser console shows 404 errors for endpoints like `/status`, `/logs`, `/whatsapp-qr`
- Error message like `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`

**Solutions:**

1. **Verify the server is running:**
   ```bash
   # Check if the Node.js process is running
   ps aux | grep node
   ```

2. **Check server logs:**
   ```bash
   # View recent logs
   tail -n 100 nohup.out
   ```

3. **Verify folder structure:**
   ```bash
   # Make sure these files exist
   ls -la src/index.js
   ls -la src/routes/messageRouter.js
   ```

4. **Test with minimal server:**
   ```bash
   # Run the health check server
   node health-server.js
   ```

5. **Restart the server with debugging:**
   ```bash
   # Run with debugging enabled
   DEBUG=express:* node src/index.js
   ```

### 2. Connection Refused Errors

**Symptoms:**
- Browser shows "Connection refused" or cannot connect
- ECONNREFUSED errors in console

**Solutions:**

1. **Check if port 3000 is open:**
   ```bash
   # See what's using port 3000
   sudo lsof -i :3000
   
   # Check if firewall is blocking
   sudo ufw status
   ```

2. **Make sure the server is listening on all interfaces:**
   Ensure your Express app uses:
   ```javascript
   app.listen(PORT, '0.0.0.0', () => {...});
   ```

3. **Test with netcat:**
   ```bash
   # Test if port is open
   nc -vz localhost 3000
   ```

### 3. Path/Directory Issues

**Symptoms:**
- Server starts but can't find modules or files
- Errors like "Cannot find module" or "ENOENT: no such file or directory"

**Solutions:**

1. **Verify package installation:**
   ```bash
   # Make sure all dependencies are installed
   npm install
   ```

2. **Check working directory:**
   ```bash
   # Should show the correct project root
   pwd
   ```

3. **Run the diagnostic script:**
   ```bash
   # Run with reinstall flag to refresh modules
   ./start.sh --reinstall
   ```

### 4. WhatsApp Client Issues

**Symptoms:**
- WhatsApp QR code doesn't appear
- "WhatsApp client not connected" messages

**Solutions:**

1. **Check for Puppeteer dependencies:**
   ```bash
   # Install system dependencies for Puppeteer
   sudo apt update
   sudo apt install -y gconf-service libgbm-dev libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
   ```

2. **Clear auth data and restart:**
   ```bash
   # Remove auth data to force new QR code
   rm -rf auth_data
   ```

3. **Check server logs for WhatsApp client errors**

## Testing Tools

Use these tools to diagnose issues:

1. **test-server.js**: Test all API endpoints
   ```bash
   node test-server.js 142.93.97.234 3000
   ```

2. **health-server.js**: Run minimal Express server
   ```bash
   node health-server.js
   ```

## When All Else Fails

1. **Redeploy from scratch:**
   ```bash
   # Clone repository fresh
   git clone YOUR_REPO_URL
   cd YOUR_REPO_FOLDER
   npm install
   node src/index.js
   ```

2. **Check Digital Ocean configuration:**
   - Verify firewall settings in DigitalOcean console
   - Ensure port 3000 is open in security groups
   - Consider using NGINX as a reverse proxy if needed 