/**
 * Bot launcher with universal keep-alive
 * Author: Gtajisan aka Farhan legacy edition 
 */

const { spawn } = require("child_process");
const log = require("./logger/log.js");
const express = require("express");
const axios = require("axios");

// ─── Conditional Keep-alive Server ───
function startServer() {
  const PORT = process.env.PORT;
  if (!PORT) {
    if (log.info) log.info("No PORT provided, skipping keep-alive server.");
    return;
  }

  const app = express();
  app.get("/", (req, res) => {
    res.send("Goat Bot is running");
  });

  app.listen(PORT, () => {
    if (log.info) {
      log.info(`Keep-alive server started on port ${PORT}`);
    } else {
      console.log(`Keep-alive server started on port ${PORT}`);
    }
  });
}

// ─── Optional Self-ping ───
function startSelfPing() {
  const APP_URL = process.env.APP_URL;
  if (!APP_URL) {
    if (log.info) log.info("No APP_URL set, skipping self-ping.");
    return;
  }

  setInterval(() => {
    axios.get(APP_URL).catch(() => {
      if (log.error) {
        log.error("Self-ping failed");
      } else {
        console.error("Self-ping failed");
      }
    });
  }, 5 * 60 * 1000); // every 5 minutes
}

// ─── Restart logic ───
function startProject() {
  const child = spawn("node", ["Goat.js"], {
    cwd: __dirname,
    stdio: "inherit",
    shell: true,
  });

  child.on("close", (code) => {
    if (code !== 0) {
      if (log.info) {
        log.info(`Goat.js exited with code ${code}, restarting...`);
      } else {
        console.log(`Goat.js exited with code ${code}, restarting...`);
      }
      startProject();
    } else {
      if (log.info) {
        log.info("Goat.js exited cleanly.");
      } else {
        console.log("Goat.js exited cleanly.");
      }
    }
  });
}

// ─── Entry Point ───
startServer();
startSelfPing();
startProject();
  
