const axios = require("axios");

module.exports.config = {
  name: "country",
  version: "1.1",
  hasPermission: 0,
  credits: "Farhan",
  description: "Get detailed information about a country",
  commandCategory: "Utilities",
  usages: "country <country name>",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const name = args.join(" ").trim();

  if (!name) {
    return api.sendMessage(
`─── Country Info ───
Please provide a country name.

Usage:
• country <country name>

Example:
• country Philippines`,
      threadID, messageID
    );
  }

  try {
    await api.sendMessage(
      `Fetching information for: "${name}"...`,
      threadID, messageID
    );

    const apiUrl = "https://rapido.zetsu.xyz/api/country";
    const response = await axios.get(apiUrl, { params: { name } });
    const data = response.data;

    let resultMsg = "─── Country Info ───\n\n";

    if (typeof data === "object" && (data.country || data.name)) {
      resultMsg += `• Country   : ${data.country || data.name}\n`;
      if (data.capital) resultMsg += `• Capital   : ${data.capital}\n`;
      if (data.region) resultMsg += `• Region    : ${data.region}\n`;
      if (data.subregion) resultMsg += `• Subregion : ${data.subregion}\n`;
      if (data.population) resultMsg += `• Population: ${data.population}\n`;
      if (data.area) resultMsg += `• Area      : ${data.area} km²\n`;
      if (data.currency) resultMsg += `• Currency  : ${data.currency}\n`;
      if (data.languages) resultMsg += `• Languages : ${data.languages}\n`;
      if (data.flag) resultMsg += `• Flag      : ${data.flag}\n`;
      if (data.timezone) resultMsg += `• Timezone  : ${data.timezone}\n`;
    } else {
      resultMsg += "No data found for this country.";
    }

    return api.sendMessage(resultMsg, threadID, messageID);

  } catch (error) {
    console.error("Error in country command:", error.message || error);
    return api.sendMessage(
`─── Country Error ───
Failed to fetch country info.

Reason:
${error.response?.data?.message || error.message || "Unknown error"}`,
      threadID, messageID
    );
  }
};
                                     
