/**
 * Minimal Express server to verify basic connectivity
 * If the main app isn't working, run this minimal server to test
 */

const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// Basic JSON endpoint
app.get("/health", (req, res) => {
  console.log(`Health check received from ${req.ip}`);
  res.json({
    success: true,
    message: "Health check server is running correctly",
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

// Root path
app.get("/", (req, res) => {
  console.log(`Root path accessed from ${req.ip}`);
  res.send(`
    <html>
      <head>
        <title>Health Check Server</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          pre { background: #f4f4f4; padding: 10px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <h1>Health Check Server</h1>
        <p>This is a minimal Express server to verify your setup is working.</p>
        <p>To check the JSON endpoint, <a href="/health">click here</a>.</p>
        <h2>Environment Information:</h2>
        <pre>
Node Version: ${process.version}
Platform: ${process.platform}
Working Directory: ${process.cwd()}
Current Time: ${new Date().toISOString()}
        </pre>
      </body>
    </html>
  `);
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Health check server running at http://localhost:${PORT}`);
  console.log(`Try accessing these URLs:`);
  console.log(`  - http://YOUR_IP:${PORT}/`);
  console.log(`  - http://YOUR_IP:${PORT}/health`);
});
