const express = require("express");
const path = require("path");
const messageRouter = require("./routes/messageRouter");
const whatsappClient = require("./services/WhatsppClient");

console.log("Starting WhatsApp Bot service...");
console.log(`Server root directory: ${__dirname}`);
console.log(`Current working directory: ${process.cwd()}`);

// Initialize WhatsApp client with better error handling
try {
  console.log("Initializing WhatsApp client...");
  whatsappClient
    .initialize()
    .then(() => {
      console.log("WhatsApp client initialization sequence completed");
    })
    .catch((err) => {
      console.error("Error during WhatsApp client initialization:", err);
      // Continue running the server even if WhatsApp client fails
    });
} catch (error) {
  console.error("Critical error initializing WhatsApp client:", error);
  // Continue running the server even if WhatsApp client fails
}

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Add detailed logging middleware with path information
app.use((req, res, next) => {
  const startTime = Date.now();
  console.log(
    `${new Date().toISOString()} - ${req.method} ${
      req.originalUrl
    } - Request started (IP: ${req.ip})`
  );

  // Add listener for when response finishes
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    console.log(
      `${new Date().toISOString()} - ${req.method} ${
        req.originalUrl
      } - Response: ${res.statusCode} (${duration}ms)`
    );
  });

  next();
});

// Register API routes (with both /api prefix and direct path for backwards compatibility)
app.use("/api", messageRouter);
app.use("/", messageRouter);

// Serve the main HTML file at the root
app.get("/", (req, res) => {
  console.log(
    `Serving index.html from: ${path.join(__dirname, "public", "index.html")}`
  );
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Catch-all handler for 404s to return JSON instead of HTML for API paths
app.use((req, res, next) => {
  if (
    req.path.startsWith("/api/") ||
    req.path === "/status" ||
    req.path === "/logs" ||
    req.path === "/whatsapp-qr" ||
    req.path === "/test-json" ||
    req.path === "/reinitialize-whatsapp"
  ) {
    console.log(`404 for API path: ${req.path}`);
    return res.status(404).json({
      success: false,
      message: `API endpoint not found: ${req.path}`,
      available_endpoints: [
        "/status",
        "/logs",
        "/whatsapp-qr",
        "/test-json",
        "/reinitialize-whatsapp",
      ],
      timestamp: new Date().toISOString(),
    });
  }

  // For non-API routes, pass to next handler
  next();
});

// Health check endpoint for Render
app.get("/health", (req, res) => {
  const clientStatus = whatsappClient.info ? "Connected" : "Initializing";
  const qrAvailable = whatsappClient.getQrCode() ? true : false;

  res.status(200).json({
    status: "OK",
    whatsapp: clientStatus,
    qrAvailable: qrAvailable,
    timestamp: new Date().toISOString(),
  });
});

// Get port from environment variable for cloud platforms
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Local URL: http://localhost:${PORT}`);
  console.log(`Public URL: http://${process.env.HOST || "127.0.0.1"}:${PORT}`);
  console.log("Available routes:");
  console.log("  - /");
  console.log("  - /status");
  console.log("  - /whatsapp-qr");
  console.log("  - /logs");
  console.log("  - /test-json");
  console.log("  - /reinitialize-whatsapp");
  console.log("  - /health");
});
