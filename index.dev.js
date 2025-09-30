/**
 * Bot launcher with keep-alive for Render
 * Author: Gtajisan aka Farhan
 */

const { spawn } = require("child_process");
const log = require("./logger/log.js");
const express = require("express");
const axios = require("axios");

// ─── Keep-alive server ───
const app = express();
const PORT = process.env.PORT || 3000;

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

// ─── Self-ping for Render ───
const RENDER_URL = "https://baka-chan-1-odd9.onrender.com";

setInterval(() => {
  axios.get(RENDER_URL).catch(() => {
    if (log.error) {
      log.error("Self-ping failed");
    } else {
      console.error("Self-ping failed");
    }
  });
}, 5 * 60 * 1000); // every 5 minutes

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

startProject();
