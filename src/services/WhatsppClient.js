const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

// Determine if we're in production (Render.com) or development
const isProduction = process.env.NODE_ENV === "production";

// Store the most recent QR code
let lastQrCode = null;

// Configure WhatsApp client with appropriate settings for environment
const whatsappClient = new Client({
  authStrategy: new LocalAuth({ dataPath: "./auth_data" }),
  puppeteer: {
    headless: isProduction ? true : false,
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
    timeout: 60000, // Increase timeout to 60 seconds
    // If in production, we need to use Chromium from apt-get
    executablePath: isProduction ? "/usr/bin/chromium-browser" : undefined,
  },
});

// Log QR code to terminal and save to a file for remote access
whatsappClient.on("qr", (qr) => {
  // Store the QR code for web access
  lastQrCode = qr;

  // Generate QR in terminal for local development
  qrcode.generate(qr, { small: true });

  // For production environment, log QR code to use via logs
  console.log("QR RECEIVED");

  // In production, you may want to store this somewhere accessible
  if (isProduction) {
    console.log("-----------------------------------------------");
    console.log("SCAN THIS QR CODE WITH YOUR WHATSAPP MOBILE APP:");
    console.log("-----------------------------------------------");
    console.log(qr);
    console.log("-----------------------------------------------");
  }
});

whatsappClient.on("ready", () => {
  console.log("WhatsApp client is ready");
  // Clear QR code when client is ready (authenticated)
  lastQrCode = null;
});

whatsappClient.on("authenticated", () => {
  console.log("WhatsApp client authenticated");
  // Clear QR code when authenticated
  lastQrCode = null;
});

whatsappClient.on("auth_failure", (msg) =>
  console.error("WhatsApp authentication failure:", msg)
);

whatsappClient.on("disconnected", (reason) =>
  console.log("WhatsApp client disconnected:", reason)
);

whatsappClient.on("message", async (msg) => {
  try {
    if (msg.from != "status@broadcast") {
      const contact = await msg.getContact();
      console.log(contact, msg.body);
    }
  } catch (error) {
    console.log(error);
  }
});

// Add a method to get the current QR code
whatsappClient.getQrCode = () => {
  return lastQrCode;
};

module.exports = whatsappClient;
