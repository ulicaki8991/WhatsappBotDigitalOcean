#!/usr/bin/env node

/**
 * Basic test script to verify server routes are properly working
 * Run this script to verify the server is responding correctly
 */

const http = require("http");

// Configuration
const serverIP = process.argv[2] || "127.0.0.1"; // Accept IP from command line or use localhost
const serverPort = process.argv[3] || 3000; // Accept port from command line or use 3000
const baseUrl = `http://${serverIP}:${serverPort}`;

console.log(`Testing server at ${baseUrl}`);

// List of endpoints to test
const endpoints = [
  "/", // Main page
  "/test-json", // Test JSON endpoint
  "/status", // WhatsApp status
  "/logs", // Logs endpoint
  "/api/test-json", // API version
  "/this-path-doesnt-exist", // Testing 404 handling
];

// Function to test a single endpoint
function testEndpoint(path) {
  return new Promise((resolve) => {
    const url = `${baseUrl}${path}`;
    console.log(`Testing ${url}...`);

    const req = http.get(url, (res) => {
      const { statusCode } = res;
      const contentType = res.headers["content-type"] || "";

      let rawData = "";
      res.on("data", (chunk) => {
        rawData += chunk;
      });

      res.on("end", () => {
        console.log(`  Status: ${statusCode}`);
        console.log(`  Content-Type: ${contentType}`);

        // For successful JSON responses, parse and display
        if (statusCode === 200 && contentType.includes("application/json")) {
          try {
            const parsedData = JSON.parse(rawData);
            console.log(`  Response: Valid JSON`);
            console.log(`  Keys: ${Object.keys(parsedData).join(", ")}`);
          } catch (e) {
            console.log(`  Response: Invalid JSON`);
            console.log(
              `  Raw (first 100 chars): ${rawData.substring(0, 100)}...`
            );
          }
        } else {
          // For non-JSON or error responses, show beginning
          console.log(
            `  Raw (first 100 chars): ${rawData.substring(0, 100)}...`
          );
        }

        resolve();
      });
    });

    req.on("error", (e) => {
      console.log(`  Error: ${e.message}`);
      resolve();
    });

    // Set a timeout
    req.setTimeout(5000, () => {
      console.log(`  Error: Connection timeout`);
      req.destroy();
      resolve();
    });
  });
}

// Test all endpoints
async function runTests() {
  console.log("=== Starting tests ===");

  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
    console.log(""); // Empty line for spacing
  }

  console.log("=== Tests completed ===");
}

runTests().catch((err) => console.error(`Test error: ${err.message}`));

console.log("\nUsage:");
console.log("  node test-server.js [server-ip] [port]");
console.log("Example:");
console.log("  node test-server.js 142.93.97.234 3000\n");
