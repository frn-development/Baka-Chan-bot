const os = require("os");
const { execSync } = require("child_process");

module.exports = {
  config: {
    name: "upt",
    aliases: ["uptime", "system", "status"],
    version: "1.1",
    author: "Farhan",
    role: 0,
    shortDescription: {
      en: "Displays uptime, bot users, threads, and system info"
    },
    longDescription: {
      en: "Shows bot uptime, total users, total threads, RAM, CPU, Node version, platform, and disk usage."
    },
    category: "system",
    guide: {
      en: "Use {p}upt to check bot and system status."
    }
  },

  onStart: async function ({ api, event, usersData, threadsData }) {
    try {
      // Bot users & threads
      const allUsers = await usersData.getAll();
      const allThreads = await threadsData.getAll();

      // Bot uptime
      const uptime = process.uptime();
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      const uptimeStr = `${hours}Hrs ${minutes}Min ${seconds}Sec`;

      // RAM usage
      const ramUsed = (os.totalmem() - os.freemem()) / 1024 / 1024 / 1024;
      const ramTotal = os.totalmem() / 1024 / 1024 / 1024;

      // CPU
      const cpus = os.cpus();
      const cpuModel = cpus[0].model;
      const cpuCores = cpus.length;

      // Node & Platform
      const nodeVersion = process.version;
      const platform = os.platform();

      // Disk Usage (Linux/macOS)
      let diskUsage = "Unavailable";
      try {
        const df = execSync("df -h /").toString().split("\n")[1].split(/\s+/);
        diskUsage = `${df[1]} total / ${df[2]} used / ${df[3]} available`;
      } catch {
        diskUsage = "Not supported";
      }

      // Compose message
      const msg =
`=== Bot & System Info ===
⏰ Bot Uptime      : ${uptimeStr}
👪 Total Users     : ${allUsers.length}
🌸 Total Threads   : ${allThreads.length}

💻 RAM Usage       : ${ramUsed.toFixed(2)}GB / ${ramTotal.toFixed(2)}GB
🖥 CPU            : ${cpuModel} (${cpuCores} cores)
📝 Node Version    : ${nodeVersion}
🖧 Platform       : ${platform}
💽 Disk Usage      : ${diskUsage}
========================`;

      api.sendMessage(msg, event.threadID);
    } catch (error) {
      console.error("Upt command error:", error);
      api.sendMessage("An error occurred while retrieving bot/system info.", event.threadID);
    }
  }
};
