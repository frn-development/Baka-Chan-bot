/**
 * Goat Bot universal launcher with keep-alive
 * Author: NTKhang (original) | Maintained by Gtajisan (Farhan)
 */

const { spawn } = require("child_process");
const log = require("./logger/log.js");
const express = require("express");
const axios = require("axios");

/**
 * ─── Keep-alive HTTP server ───
 * Runs only if a hosting provider gives a PORT (Render, Heroku, Railway, etc.)
 */
function startServer() {
  const PORT = process.env.PORT || 3000; // Fallback to 3000 if not provided

  // If PORT < 1024, you need root; fallback automatically
  const safePort = PORT < 1024 ? 3000 : PORT;

  const app = express();
  app.get("/", (req, res) => res.send("Goat Bot is running"));

  app.listen(safePort, "0.0.0.0", () => {
    if (log.info) log.info(`Keep-alive server started on port ${safePort}`);
    else console.log(`Keep-alive server started on port ${safePort}`);
  });
}

/**
 * ─── Optional self-ping ───
 * Keeps the app alive on free tiers. Set APP_URL in your environment.
 */
function startSelfPing() {
  const APP_URL = process.env.APP_URL;
  if (!APP_URL) {
    if (log.info) log.info("No APP_URL set, skipping self-ping.");
    return;
  }

  setInterval(() => {
    axios.get(APP_URL).catch(() => {
      if (log.error) log.error("Self-ping failed");
      else console.error("Self-ping failed");
    });
  }, 5 * 60 * 1000); // every 5 minutes
}

/**
 * ─── Restart logic ───
 * Restarts Goat.js if it exits with any non-zero code.
 */
function startProject() {
  const child = spawn("node", ["Goat.js"], {
    cwd: __dirname,
    stdio: "inherit",
    shell: true,
  });

  child.on("close", (code) => {
    if (code !== 0) {
      if (log.info) log.info
        ? log.info(`Goat.js exited with code ${code}, restarting...`)
        : console.log(`Goat.js exited with code ${code}, restarting...`);
      startProject();
    } else {
      if (log.info) log.info
        ? log.info("Goat.js exited cleanly.")
        : console.log("Goat.js exited cleanly.");
    }
  });
}

/**
 * ─── Entry Point ───
 */
startServer();
startSelfPing();
startProject();
