/**
 * Bot launcher with keep-alive for Render
 * Author: Gtajisan aka farhan (unchanged as requested)
 */

const { spawn } = require("child_process");
const log = require("./logger/log.js");
const express = require("express");

// ─── Keep-alive server for Render ───
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Goat Bot is running");
});

app.listen(PORT, () => {
  log.info(`Keep-alive server started on port ${PORT}`);
});

// ─── Restart logic ───
function startProject() {
  const child = spawn("node", ["Goat.js"], {
    cwd: __dirname,
    stdio: "inherit",
    shell: true
  });

  child.on("close", (code) => {
    if (code == 2) {
      log.info("Restarting Project...");
      startProject();
    } else {
      log.error(`Goat.js exited with code ${code}`);
    }
  });
}

startProject();
