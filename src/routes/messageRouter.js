const express = require("express");
const whatsappClient = require("../services/WhatsppClient");
const messageTemplates = require("../services/MessageTemplates");

const router = new express.Router();

router.get("/", (req, res) => {
  res.send("WhatsApp Bot API is running");
});

// Endpoint to send a message
router.post("/send-message", async (req, res) => {
  try {
    const { number, message } = req.body;

    if (!number || !message) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide both 'number' and 'message' in the request body",
      });
    }

    // Format the number (ensure it has the correct format with country code)
    const formattedNumber = number.includes("@c.us")
      ? number
      : `${number.replace(/[^\d]/g, "")}@c.us`;

    // Send the message
    const response = await whatsappClient.sendMessage(formattedNumber, message);

    res.status(200).json({
      success: true,
      message: "Message sent successfully",
      data: response,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
});

// New endpoint to send price notification
router.post("/send-price-notification", async (req, res) => {
  try {
    const {
      number,
      price,
      currency = "$",
      templateType = "priceNotification",
      customTemplate,
    } = req.body;

    if (!number || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide both 'number' and 'price' in the request body",
      });
    }

    // Format the number (ensure it has the correct format with country code)
    const formattedNumber = number.includes("@c.us")
      ? number
      : `${number.replace(/[^\d]/g, "")}@c.us`;

    // Generate the message with the price using the appropriate template
    let message;

    if (templateType === "custom" && customTemplate) {
      message = messageTemplates.custom(price, customTemplate, currency);
    } else if (templateType === "paymentConfirmation") {
      message = messageTemplates.paymentConfirmation(price, currency);
    } else {
      // Default to price notification
      message = messageTemplates.priceNotification(price, currency);
    }

    // Send the message
    const response = await whatsappClient.sendMessage(formattedNumber, message);

    res.status(200).json({
      success: true,
      message: "Price notification sent successfully",
      data: {
        to: number,
        price: typeof price === "number" ? price.toFixed(2) : price,
        messageId: response.id,
        template: templateType,
      },
    });
  } catch (error) {
    console.error("Error sending price notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send price notification",
      error: error.message,
    });
  }
});

// Get connection status
router.get("/status", (req, res) => {
  const isConnected = !!whatsappClient.info;
  const status = isConnected ? "Connected" : "Not connected";
  const qrAvailable = whatsappClient.getQrCode() ? true : false;

  res.status(200).json({
    status,
    isConnected,
    qrAvailable,
    timestamp: new Date().toISOString(),
  });
});

// New endpoint to get WhatsApp QR code
router.get("/whatsapp-qr", (req, res) => {
  try {
    // Check if the function exists
    if (typeof whatsappClient.getQrCode !== "function") {
      return res.status(200).json({
        success: false,
        message: "QR code functionality not available",
        timestamp: new Date().toISOString(),
      });
    }

    const qrCode = whatsappClient.getQrCode();

    if (qrCode) {
      return res.status(200).json({
        success: true,
        qrCode,
        timestamp: new Date().toISOString(),
      });
    } else {
      return res.status(200).json({
        success: false,
        message:
          "QR code not available. Either WhatsApp is already connected or still initializing.",
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Error getting QR code:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve QR code: " + error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// New endpoint to get WhatsApp client logs
router.get("/logs", (req, res) => {
  try {
    // Check if the logs function exists
    if (typeof whatsappClient.getLogs !== "function") {
      return res.status(200).json({
        success: false,
        message: "Logs functionality not available",
        logs: [],
        timestamp: new Date().toISOString(),
      });
    }

    const logs = whatsappClient.getLogs() || [];

    // Ensure logs is an array
    const safeLogsArray = Array.isArray(logs) ? logs : [];

    return res.status(200).json({
      success: true,
      logs: safeLogsArray,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error getting logs:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve logs: " + error.message,
      logs: [],
      timestamp: new Date().toISOString(),
    });
  }
});

// Simple test endpoint to verify JSON responses are working
router.get("/test-json", (req, res) => {
  res.status(200).json({
    success: true,
    message: "JSON endpoint is working correctly",
    timestamp: new Date().toISOString(),
  });
});

// Endpoint to reinitialize the WhatsApp client
router.post("/reinitialize-whatsapp", (req, res) => {
  try {
    if (typeof whatsappClient.initialize !== "function") {
      return res.status(400).json({
        success: false,
        message: "WhatsApp client does not have an initialize method",
        timestamp: new Date().toISOString(),
      });
    }

    // Attempt to initialize
    whatsappClient
      .initialize()
      .then(() => {
        console.log("WhatsApp client manually reinitialized");
      })
      .catch((err) => {
        console.error(
          "Error during manual WhatsApp client initialization:",
          err
        );
      });

    return res.status(200).json({
      success: true,
      message:
        "WhatsApp client reinitialization has been triggered. Check logs for progress.",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error triggering reinitialization:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reinitialize WhatsApp client: " + error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = router;
