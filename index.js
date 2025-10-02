/**
 * Goat Bot universal launcher with keep-alive & auto-restart
 * Author: NTKhang (original) | Maintained by Gtajisan (Farhan)
 */

const { spawn } = require("child_process");
const log = require("./logger/log.js");
const express = require("express");
const axios = require("axios");
const path = require("path");

/* ─── Keep-alive HTTP server ─── */
function startServer() {
  // Use platform PORT or max fallback (65535)
  const PORT = parseInt(process.env.PORT, 10) || 65535;
  const safePort = PORT < 1024 ? 65535 : PORT;

  const app = express();

  app.get("/", (req, res) => {
    try {
      res.sendFile(path.join(__dirname, "index.html"));
    } catch {
      res.send("🐐 Goat Bot is running and alive 24/7!");
    }
  });

  app.get("/status", (req, res) => {
    res.json({
      status: "running",
      uptime: process.uptime(),
      restarts: global.countRestart || 0,
      port: safePort,
      maintainer: "Gtajisan (Farhan)"
    });
  });

  app.listen(safePort, "0.0.0.0", () => {
    log.info
      ? log.info(`Keep-alive server started on port ${safePort}`)
      : console.log(`Keep-alive server started on port ${safePort}`);
  });
}

/* ─── Self-ping to prevent Render sleeping ─── */
function startSelfPing() {
  const APP_URL = process.env.APP_URL;
  if (!APP_URL) {
    log.info ? log.info("No APP_URL set, skipping self-ping.") : console.log("No APP_URL set, skipping self-ping.");
    return;
  }

  setInterval(() => {
    axios.get(APP_URL).catch(() => {
      log.error ? log.error("Self-ping failed") : console.error("Self-ping failed");
    });
  }, 5 * 60 * 1000); // every 5 min
}

/* ─── Bot Auto-Restart Logic ─── */
global.countRestart = global.countRestart || 0;

function startProject(message) {
  if (message) log.info ? log.info(message) : console.log(message);

  const child = spawn("node", ["Goat.js"], {
    cwd: __dirname,
    stdio: "inherit",
    shell: true,
  });

  child.on("close", (code) => {
    if (code !== 0) {
      global.countRestart++;
      log.error
        ? log.error(`Goat.js crashed with code ${code}. Restarting... (#${global.countRestart})`)
        : console.error(`Goat.js crashed with code ${code}. Restarting... (#${global.countRestart})`);

      setTimeout(() => startProject(), 3000);
    } else {
      log.info ? log.info("Goat.js exited cleanly.") : console.log("Goat.js exited cleanly.");
      // Relaunch anyway to stay alive
      setTimeout(() => startProject(), 3000);
    }
  });

  child.on("error", (err) => {
    log.error ? log.error(`Launcher error: ${err.message}`) : console.error(`Launcher error: ${err.message}`);
    setTimeout(() => startProject(), 5000);
  });
}

/* ─── Entry Point ─── */
startServer();
startSelfPing();
startProject("Starting Goat.js bot...");
