const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
	config: {
		name: "admin",
		version: "1.7",
		author: "NTKhang | Improved by Farhan",
		countDown: 5,
		role: 2,
		description: {
			vi: "Thêm, xóa, sửa quyền admin",
			en: "Add, remove, edit admin role"
		},
		category: "box chat",
		guide: {
			vi: '   {pn} [add | -a] <uid | @tag | reply>: Thêm quyền admin cho người dùng'
				+ '\n   {pn} [remove | -r] <uid | @tag | reply>: Xóa quyền admin của người dùng'
				+ '\n   {pn} [list | -l]: Liệt kê danh sách admin',
			en: '   {pn} [add | -a] <uid | @tag | reply>: Add admin role for user'
				+ '\n   {pn} [remove | -r] <uid | @tag | reply>: Remove admin role of user'
				+ '\n   {pn} [list | -l]: List all admins'
		}
	},

	langs: {
		vi: {
			added: "✅ | Đã thêm quyền admin cho %1 người dùng:\n%2",
			alreadyAdmin: "\n⚠️ | %1 người dùng đã có quyền admin từ trước:\n%2",
			missingIdAdd: "⚠️ | Vui lòng nhập ID, tag hoặc reply để thêm quyền admin",
			removed: "✅ | Đã xóa quyền admin của %1 người dùng:\n%2",
			notAdmin: "⚠️ | %1 người dùng không có quyền admin:\n%2",
			missingIdRemove: "⚠️ | Vui lòng nhập ID, tag hoặc reply để xóa quyền admin",
			listAdmin: "👑 | Danh sách admin:\n%1"
		},
		en: {
			added: "✅ | Added admin role for %1 users:\n%2",
			alreadyAdmin: "\n⚠️ | %1 users already have admin role:\n%2",
			missingIdAdd: "⚠️ | Please enter ID, tag or reply to add admin role",
			removed: "✅ | Removed admin role of %1 users:\n%2",
			notAdmin: "⚠️ | %1 users don't have admin role:\n%2",
			missingIdRemove: "⚠️ | Please enter ID, tag or reply to remove admin role",
			listAdmin: "👑 | List of admins:\n%1"
		}
	},

	onStart: async function ({ message, args, usersData, event, getLang }) {
		let uids = [];

		// Parse targets
		if (Object.keys(event.mentions).length > 0)
			uids = Object.keys(event.mentions);
		else if (event.messageReply)
			uids.push(event.messageReply.senderID);
		else
			uids = args.filter(arg => /^\d+$/.test(arg)); // only digits

		switch (args[0]) {
			case "add":
			case "-a": {
				if (uids.length === 0)
					return message.reply(getLang("missingIdAdd"));

				const notAdminIds = [];
				const alreadyAdmins = [];

				for (const uid of uids) {
					if (config.adminBot.includes(uid))
						alreadyAdmins.push(uid);
					else
						notAdminIds.push(uid);
				}

				// Ensure unique push
				config.adminBot.push(...notAdminIds.filter(id => !config.adminBot.includes(id)));

				// Save config
				writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

				// Resolve names
				const addedNames = await Promise.all(notAdminIds.map(async uid => {
					try {
						const name = await usersData.getName(uid);
						return `• ${name} (${uid})`;
					} catch {
						return `• (${uid})`;
					}
				}));
				const alreadyNames = await Promise.all(alreadyAdmins.map(async uid => {
					try {
						const name = await usersData.getName(uid);
						return `• ${name} (${uid})`;
					} catch {
						return `• (${uid})`;
					}
				}));

				return message.reply(
					(notAdminIds.length > 0 ? getLang("added", notAdminIds.length, addedNames.join("\n")) : "") +
					(alreadyAdmins.length > 0 ? getLang("alreadyAdmin", alreadyAdmins.length, alreadyNames.join("\n")) : "")
				);
			}

			case "remove":
			case "-r": {
				if (uids.length === 0)
					return message.reply(getLang("missingIdRemove"));

				const removed = [];
				const notAdminIds = [];

				for (const uid of uids) {
					if (config.adminBot.includes(uid)) {
						config.adminBot.splice(config.adminBot.indexOf(uid), 1);
						removed.push(uid);
					} else {
						notAdminIds.push(uid);
					}
				}

				// Save config
				writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

				// Resolve names
				const removedNames = await Promise.all(removed.map(async uid => {
					try {
						const name = await usersData.getName(uid);
						return `• ${name} (${uid})`;
					} catch {
						return `• (${uid})`;
					}
				}));
				const notAdminNames = notAdminIds.map(uid => `• (${uid})`);

				return message.reply(
					(removed.length > 0 ? getLang("removed", removed.length, removedNames.join("\n")) : "") +
					(notAdminIds.length > 0 ? getLang("notAdmin", notAdminIds.length, notAdminNames.join("\n")) : "")
				);
			}

			case "list":
			case "-l": {
				if (config.adminBot.length === 0)
					return message.reply(getLang("listAdmin", "• No admins yet"));

				const getNames = await Promise.all(config.adminBot.map(async uid => {
					try {
						const name = await usersData.getName(uid);
						return `• ${name} (${uid})`;
					} catch {
						return `• (${uid})`;
					}
				}));
				return message.reply(getLang("listAdmin", getNames.join("\n")));
			}

			default:
				return message.SyntaxError();
		}
	}
};
