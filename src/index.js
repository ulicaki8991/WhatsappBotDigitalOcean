const express = require("express");
const path = require("path");
const messageRouter = require("./routes/messageRouter");
const whatsappClient = require("./services/WhatsppClient");

console.log("Starting WhatsApp Bot service...");

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

// Add detailed logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  console.log(
    `${new Date().toISOString()} - ${req.method} ${
      req.originalUrl
    } - Request started`
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

// Routes
app.use("/api", messageRouter);

// For backwards compatibility
app.use(messageRouter);

// Serve the main HTML file at the root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
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
  if (process.env.RENDER_EXTERNAL_URL) {
    console.log(`Public URL: ${process.env.RENDER_EXTERNAL_URL}`);
  }
});
