const { Plugin } = require("powercord/entities");
const { React, getModule } = require("powercord/webpack");
const { open: openModal } = require("powercord/modal");
const ReactionBuilderModal = require("./components/ReactionBuilderModal");
const { getChannelId } = getModule(["getLastSelectedChannelId"], false);
const { getMessages, getMessage } = getModule(["getMessages"], false);
const { getChannel } = getModule(["getChannel"], false);

const reactions = {
	multiple: {
		wc: ["🚾"],
		back: ["🔙"],
		end: ["🔚"],
		"on!": ["🔛"],
		soon: ["🔜"],
		top: ["🔝"],
		"!!": ["‼"],
		"!?": ["⁉"],
		tm: ["™"],
		"10": ["🔟"],
		cl: ["🆑"],
		cool: ["🆒"],
		free: ["🆓"],
		id: ["🆔"],
		new: ["🆕"],
		ng: ["🆖"],
		ok: ["🆗"],
		sos: ["🆘"],
		"up!": ["🆙"],
		vs: ["🆚"],
		abc: ["🔤"],
		ab: ["🆎"],
		"18": ["🔞"],
		"100": ["💯"],
	},
	single: {
		a: ["🇦", "🅰"],
		b: ["🇧", "🅱"],
		c: ["🇨", "©"],
		d: ["🇩"],
		e: ["🇪", "📧"],
		f: ["🇫"],
		g: ["🇬"],
		h: ["🇭", "♓"],
		i: ["🇮", "ℹ"],
		j: ["🇯"],
		k: ["🇰"],
		l: ["🇱"],
		m: ["🇲", "Ⓜ️", "♏", "♍"],
		n: ["🇳", "♑"],
		o: ["🇴", "🅾", "⭕"],
		p: ["🇵", "🅿"],
		q: ["🇶"],
		r: ["🇷", "®"],
		s: ["🇸"],
		t: ["🇹", "✝️"],
		u: ["🇺"],
		v: ["🇻", "♈"],
		w: ["🇼"],
		x: ["🇽", "❎", "❌", "✖"],
		y: ["🇾"],
		z: ["🇿"],
		0: ["0️⃣"],
		1: ["1️⃣"],
		2: ["2️⃣"],
		3: ["3️⃣"],
		4: ["4️⃣"],
		5: ["5️⃣"],
		6: ["6️⃣"],
		7: ["7️⃣"],
		8: ["8️⃣"],
		9: ["9️⃣"],
		"?": ["❔", "❓"],
		"+": ["➕"],
		"-": ["➖", "⛔", "📛"],
		"!": ["❕", "❗"],
		"*": ["*️⃣"],
		$: ["💲"],
		"#": ["#️⃣"],
	},
};

let allReactions = [];
for (let i = 0; i < Object.keys(reactions.multiple).length; i++) {
	let reactionName = Object.keys(reactions.multiple)[i];
	let reactionValues = reactions.multiple[reactionName];
	allReactions = allReactions.concat(reactionValues);
}
for (let i = 0; i < Object.keys(reactions.single).length; i++) {
	let reactionName = Object.keys(reactions.single)[i];
	let reactionValues = reactions.single[reactionName];
	allReactions = allReactions.concat(reactionValues);
}

module.exports = class TextReact extends Plugin {
	async startPlugin() {
		this.loadStylesheet("style.scss");

		powercord.api.commands.registerCommand({
			command: "react",
			aliases: [],
			description: "React on a message with regional indicators",
			usage: "{c} <message id> [channel id]",
			executor: async (args) => {
				let messageid = args[0],
					channelid = args[1] || getChannelId(),
					limit = false;
				if (!messageid) {
					const messages = getMessages(channelid)._array;
					if (messages.length == 0) {
						return {
							send: false,
							result:
								"Could not get last message ID, please enter message ID manually.",
						};
					}
					messageid = messages[messages.length - 1].id;
				}
				if (!getMessage(channelid, messageid)) {
					return {
						send: false,
						result: `Could not find a message with the ID \`${messageid}\`.`,
					};
				}

				const text = args[0];
				const message = getMessage(channelid, messageid);
				const channel = getChannel(channelid);

				setTimeout(() => {
					openModal(() =>
						React.createElement(ReactionBuilderModal, {
							channel,
							message,
							reactions,
							allReactions,
						})
					);
				}, 0);
			},
		});

		this.registerCommand(
			"react",
			[],
			"React on a message with regional indicators",
			"{c} <message id> [channel id]",
			async (args) => {
				let messageid = args[0],
					channelid = args[1] || getChannelId(),
					limit = false;
				if (!messageid) {
					const messages = getMessages(channelid)._array;
					if (messages.length == 0) {
						return {
							send: false,
							result:
								"Could not get last message ID, please enter message ID manually.",
						};
					}
					messageid = messages[messages.length - 1].id;
				}
				if (!getMessage(channelid, messageid)) {
					return {
						send: false,
						result: `Could not find a message with the ID \`${messageid}\`.`,
					};
				}

				const text = args[0];
				const message = getMessage(channelid, messageid);

				setTimeout(() => {
					openModal(() =>
						React.createElement(ReactionBuilderModal, {
							message,
							reactions,
							allReactions,
						})
					);
				}, 0);
			}
		);
	}

	pluginWillUnload() {
		powercord.api.commands.unregisterCommand("react");
	}
};
