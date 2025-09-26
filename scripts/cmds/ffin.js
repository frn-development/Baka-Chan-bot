const axios = require("axios");

module.exports = {
  config: {
    name: "ffin",
    aliases: ["freefireinfo", "ffinfo"],
    version: "1.3",
    author: "Farhan & 1dev-hridoy",
    countDown: 10,
    role: 0,
    shortDescription: "Fetch Free Fire user info",
    longDescription: "Fetches detailed Free Fire user info from the provided API using UID.",
    category: "info",
    guide: {
      en: "{pn}ffin <uid>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const uid = args[0]?.replace(/[^0-9]/g, "");
    if (!uid) return api.sendMessage("⚠ Please provide a valid UID.", event.threadID);

    const apiUrl = `https://hridoy-ff-1.onrender.com/api/info?uid=${uid}`;

    try {
      const response = await axios.get(apiUrl, { timeout: 5000 });
      const data = response.data;

      if (data.error || !data.basicInfo) {
        return api.sendMessage(
          data.error
            ? `✘ API Error: ${data.error}\nContact: ${data.contact || "t.me/BD_NOOBRA"}`
            : "⚠ Invalid or missing user data. Please check the UID.",
          event.threadID
        );
      }

      const {
        _resolved_region = "N/A",
        basicInfo: {
          accountId = "N/A", nickname = "N/A", level = 0, exp = 0, liked = 0,
          rank = 0, csRank = 0, csMaxRank = 0, csRankingPoints = 0,
          maxRank = 0, rankingPoints = 0, region = "N/A", createAt = "0", lastLoginAt = "0",
          badgeCnt = 0, badgeId = 0, bannerId = 0, headPic = 0, pinId = 0, title = 0,
          releaseVersion = "N/A", seasonId = 0, showBrRank = false, showCsRank = false,
          showRank = false, weaponSkinShows = [], externalIconInfo: { showType = "N/A", status = "N/A" } = {}
        } = {},
        clanBasicInfo: {
          clanName = "N/A", clanLevel = 0, memberNum = 0, capacity = 0, clanId = "N/A", captainId: clanCaptainId = "N/A"
        } = {},
        creditScoreInfo: {
          creditScore = 0, periodicSummaryEndTime = "0", rewardState = "N/A"
        } = {},
        diamondCostRes: { diamondCost = 0 } = {},
        petInfo: {
          id: petId = "N/A", level: petLevel = 0, exp: petExp = 0, isSelected = false,
          selectedSkillId = "N/A", skinId = "N/A"
        } = {},
        profileInfo: {
          avatarId = "N/A", clothes = [], equipedSkills = [], isMarkedStar = false,
          pvePrimaryWeapon = 0, unlockTime = "0"
        } = {},
        socialInfo: {
          language = "N/A", rankShow = "N/A", signature = "N/A"
        } = {}
      } = data;

      const messageBody = `
━━━━━━━━━━━━━━━━━━━
       𝐅𝐫𝐞𝐞 𝐅𝐢𝐫𝐞 𝐔𝐬𝐞𝐫 𝐈𝐧𝐟𝐨
━━━━━━━━━━━━━━━━━━━

✦ Nickname: ${nickname}
✦ Account ID: ${accountId}
✦ Region: ${region} (${_resolved_region})
✦ Level: ${level}
✦ EXP: ${exp}
✦ Likes: ${liked}

⌬ Rank: ${rank} (Max: ${maxRank}, Points: ${rankingPoints})
⌬ CS Rank: ${csRank} (Max: ${csMaxRank}, Points: ${csRankingPoints})

⌬ Created: ${createAt !== "0" ? new Date(parseInt(createAt) * 1000).toLocaleDateString() : "N/A"}
⌬ Last Login: ${lastLoginAt !== "0" ? new Date(parseInt(lastLoginAt) * 1000).toLocaleDateString() : "N/A"}

⌬ Badges: ${badgeCnt}
⌬ Badge ID: ${badgeId} | Banner ID: ${bannerId}
⌬ Head Pic ID: ${headPic} | Pin ID: ${pinId}
⌬ Title ID: ${title} | Version: ${releaseVersion}
⌬ Season ID: ${seasonId}

⌬ Weapon Skins: ${weaponSkinShows.length ? weaponSkinShows.join(", ") : "None"}
⌬ External Icon: ${showType} (${status})

━━━ Clan Info ━━━
✧ Clan: ${clanName} (Level ${clanLevel})
✧ Members: ${memberNum}/${capacity}
✧ Clan ID: ${clanId}
✧ Captain ID: ${clanCaptainId}

━━━ Credit Score ━━━
✧ Score: ${creditScore}
✧ Reward State: ${rewardState}

━━━ Diamond ━━━
✧ Cost: ${diamondCost}

━━━ Pet Info ━━━
✧ Pet ID: ${petId} | Level: ${petLevel} | EXP: ${petExp}
✧ Selected: ${isSelected ? "Yes" : "No"}
✧ Skill ID: ${selectedSkillId} | Skin ID: ${skinId}

━━━ Profile ━━━
✧ Avatar ID: ${avatarId}
✧ Clothes: ${clothes.length ? clothes.join(", ") : "None"}
✧ Equipped Skills: ${equipedSkills.length ? equipedSkills.join(", ") : "None"}
✧ Marked Star: ${isMarkedStar ? "Yes" : "No"}
✧ PvE Weapon: ${pvePrimaryWeapon}
✧ Unlock Time: ${unlockTime !== "0" ? new Date(parseInt(unlockTime) * 1000).toLocaleDateString() : "N/A"}

━━━ Social ━━━
✧ Language: ${language}
✧ Rank Show: ${rankShow}
✧ Signature: ${signature}
━━━━━━━━━━━━━━━━━━━
      `.trim();

      api.sendMessage(messageBody, event.threadID);
    } catch (error) {
      console.error("Error fetching user info:", error);
      let errorMsg = "✘ Failed to fetch user info. Try again later.";
      if (error.response?.status === 500) {
        errorMsg = "✘ API server error (500). Contact: t.me/BD_NOOBRA";
      } else if (error.code === "ECONNABORTED") {
        errorMsg = "✘ Request timed out. Please try again.";
      } else if (error.name === "TypeError") {
        errorMsg = "✘ Invalid data format received from API. Check UID or retry.";
      }
      api.sendMessage(errorMsg, event.threadID);
    }
  }
};
