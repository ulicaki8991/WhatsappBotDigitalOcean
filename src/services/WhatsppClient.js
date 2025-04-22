const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

// Determine if we're in production environment
const isProduction = process.env.NODE_ENV === "production";

// Store the most recent QR code
let lastQrCode = null;

// Store initialization logs
let initLogs = [];

// Log helper function
const logMessage = (message) => {
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} - ${message}`;
  console.log(logEntry);

  // Keep only the last 50 logs
  initLogs.unshift(logEntry);
  if (initLogs.length > 50) {
    initLogs.pop();
  }

  return logEntry;
};

// Configure WhatsApp client with appropriate settings for environment
const whatsappClient = new Client({
  authStrategy: new LocalAuth({ dataPath: "./auth_data" }),
  puppeteer: {
    // Always use headless mode in both production and development
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--single-process",
      "--disable-gpu",
    ],
    timeout: 120000, // Increase timeout to 120 seconds
    // Don't specify executablePath - let Puppeteer find the right one
    // executablePath: isProduction ? "/usr/bin/chromium-browser" : undefined,
  },
});

// Log QR code to terminal and save for web access
whatsappClient.on("qr", (qr) => {
  // Store the QR code for web access
  lastQrCode = qr;

  // Generate QR in terminal for local development
  qrcode.generate(qr, { small: true });

  // Log QR received event
  logMessage("WhatsApp QR code received and ready for scanning");
});

whatsappClient.on("loading_screen", (percent, message) => {
  logMessage(`WhatsApp loading: ${percent}% - ${message}`);
});

whatsappClient.on("ready", () => {
  logMessage("WhatsApp client is ready and fully connected");
  // Clear QR code when client is ready (authenticated)
  lastQrCode = null;
});

whatsappClient.on("authenticated", () => {
  logMessage("WhatsApp client authenticated successfully");
  // Clear QR code when authenticated
  lastQrCode = null;
});

whatsappClient.on("auth_failure", (msg) => {
  logMessage(`WhatsApp authentication failure: ${msg}`);
});

whatsappClient.on("disconnected", (reason) => {
  logMessage(`WhatsApp client disconnected: ${reason}`);
  // Set QR to null when disconnected
  lastQrCode = null;
});

whatsappClient.on("message", async (msg) => {
  try {
    if (msg.from != "status@broadcast") {
      const contact = await msg.getContact();
      logMessage(
        `Message from ${contact.pushname || contact.number}: ${msg.body}`
      );
    }
  } catch (error) {
    logMessage(`Error processing message: ${error.message}`);
  }
});

// Add a method to get the current QR code
whatsappClient.getQrCode = () => {
  return lastQrCode;
};

// Add a method to get initialization logs
whatsappClient.getLogs = () => {
  return initLogs;
};

module.exports = whatsappClient;
