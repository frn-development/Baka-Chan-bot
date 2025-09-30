const os = require("os");
const { execSync } = require("child_process");

module.exports = {
  config: {
    name: "uptime",
    aliases: ["sys", "status", "sysinfo"],
    version: "1.0",
    author: "Farhan",
    role: 0,
    shortDescription: {
      en: "Displays detailed system information"
    },
    longDescription: {
      en: "Shows CPU, RAM, disk usage, Node version, platform, and system uptime."
    },
    category: "system",
    guide: {
      en: "Use {p}system to check system information."
    }
  },

  onStart: async function ({ api, event }) {
    const { threadID } = event;

    try {
      // System uptime
      const uptime = os.uptime();
      const days = Math.floor(uptime / 86400);
      const hours = Math.floor((uptime % 86400) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      const uptimeStr = `${days}d ${hours}h ${minutes}m ${seconds}s`;

      // RAM
      const ramUsed = (os.totalmem() - os.freemem()) / 1024 / 1024 / 1024;
      const ramTotal = os.totalmem() / 1024 / 1024 / 1024;

      // CPU
      const cpus = os.cpus();
      const cpuModel = cpus[0].model;
      const cpuCores = cpus.length;

      // Node version & platform
      const nodeVersion = process.version;
      const platform = os.platform();

      // Disk usage
      let diskUsage = "Unavailable";
      try {
        const df = execSync("df -h /").toString().split("\n")[1].split(/\s+/);
        diskUsage = `${df[1]} total / ${df[2]} used / ${df[3]} available`;
      } catch {
        diskUsage = "Not supported";
      }

      const msg =
`=== System Information ===
• Uptime      : ${uptimeStr}
• RAM         : ${ramUsed.toFixed(2)}GB / ${ramTotal.toFixed(2)}GB
• CPU         : ${cpuModel} (${cpuCores} cores)
• Node        : ${nodeVersion}
• Platform    : ${platform}
• Disk Usage  : ${diskUsage}
==========================`;

      api.sendMessage(msg, threadID);

    } catch (err) {
      console.error("System command error:", err);
      api.sendMessage("An error occurred while retrieving system info.", threadID);
    }
  }
};
