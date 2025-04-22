const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

// Determine if we're in production environment
const isProduction = process.env.NODE_ENV === "production";

// Store the most recent QR code
let lastQrCode = null;

// Store initialization logs - initialize with startup message
let initLogs = [`${new Date().toISOString()} - WhatsApp service starting up`];

// Log helper function
const logMessage = (message) => {
  try {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - ${message}`;
    console.log(logEntry);

    // Keep only the last 50 logs
    if (!Array.isArray(initLogs)) {
      initLogs = []; // Reset if somehow corrupted
    }

    initLogs.unshift(logEntry);
    if (initLogs.length > 50) {
      initLogs.pop();
    }

    return logEntry;
  } catch (error) {
    console.error("Error in logMessage:", error);
    return `${new Date().toISOString()} - Error logging message`;
  }
};

// Log initialization
logMessage("Configuring WhatsApp client");

// Set puppeteer options based on environment
const puppeteerOptions = {
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
  timeout: 120000, // 2 minutes timeout
};

// Log additional platform info
logMessage(`Platform: ${process.platform}, Node version: ${process.version}`);

// Create WhatsApp client with appropriate configuration
const whatsappClient = new Client({
  authStrategy: new LocalAuth({ dataPath: "./auth_data" }),
  puppeteer: puppeteerOptions,
});

// Log QR code to terminal and save for web access
whatsappClient.on("qr", (qr) => {
  try {
    // Store the QR code for web access
    lastQrCode = qr;

    // Generate QR in terminal for local development
    try {
      qrcode.generate(qr, { small: true });
    } catch (qrError) {
      logMessage(`Error generating QR in terminal: ${qrError.message}`);
    }

    // Log QR received event
    logMessage("WhatsApp QR code received and ready for scanning");
  } catch (error) {
    logMessage(`Error in QR handler: ${error.message}`);
  }
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
  try {
    return lastQrCode;
  } catch (error) {
    logMessage(`Error in getQrCode: ${error.message}`);
    return null;
  }
};

// Add a method to get initialization logs
whatsappClient.getLogs = () => {
  try {
    return Array.isArray(initLogs) ? initLogs : [];
  } catch (error) {
    console.error("Error in getLogs:", error);
    return [
      `${new Date().toISOString()} - Error retrieving logs: ${error.message}`,
    ];
  }
};

// Export the client
module.exports = whatsappClient;
