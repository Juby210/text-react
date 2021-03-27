const { React, getModule } = require("powercord/webpack");
const { Button } = require("powercord/components");
const { Modal } = require("powercord/components/modal");
const { FormTitle } = require("powercord/components");
const { close: closeModal } = require("powercord/modal");
const { addReaction } = getModule(["addReaction"], false);
const { getMessage } = getModule(["getMessages"], false);
const Form = require("./Form");

class ReactionBuilderModal extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			text: "",
			emojiData: {},
			error: "",
			message: this.props.message,
			reacting: false,
			preferMultiple: true,
		};
	}

	update = (text = this.state.text) => {
		if (text.length > 0) {
			const emojiData = this.generateEmojiArray(text);
			let error = "";
			if (emojiData.incomplete) {
				error +=
					"Could not find enough emojis to suit your text. Some characters will be left out. ";
			}
			if (
				emojiData.emojis.length + this.state.message.reactions.length >
				20
			) {
				error += "Too many emojis. (MAX 20) ";
			}
			this.setState({
				text,
				emojiData,
				error,
			});
		} else {
			this.setState({
				text,
				emojiData: {},
				error: "",
			});
		}
	};

	componentDidMount() {
		this.timerID = setInterval(() => this.tick(), 25e1);
	}

	componentWillUnmount() {
		clearInterval(this.timerID);
	}

	tick = () => {
		if (!this.state.message) return
		const message = getMessage(
			this.state.message.channel_id,
			this.state.message.id
		);
		if (!message) {
			closeModal();
		}
		this.setState({
			message,
		});
	};

	setReacting = (reacting) => {
		this.setState({
			reacting,
		});
	};

	setPreferMultiple = (preferMultiple) => {
		this.setState(
			{
				preferMultiple,
			},
			this.update
		);
	};

	render() {
		return (
			<Modal className="powercord-text" size={Modal.Sizes.LARGE}>
				<Modal.Header>
					<FormTitle tag="h3">React to Message</FormTitle>
					<Modal.CloseButton onClick={closeModal} />
				</Modal.Header>
				<Modal.Content>
					<Form
						channel={this.props.channel}
						message={this.state.message}
						reacting={this.state.reacting}
						text={this.state.text}
						error={this.state.error}
						emojiData={this.state.emojiData}
						preferMultiple={this.state.preferMultiple}
						update={this.update}
						react={this.react}
						setReacting={this.setReacting}
						setPreferMultiple={this.setPreferMultiple}
					/>
				</Modal.Content>
				<Modal.Footer>
					<Button
						disabled={this.state.reacting}
						onClick={async () => {
							if (!this.state.reacting) {
								this.setReacting(true);
								await this.react(this.state.emojiData);
								try {
									closeModal();
								} catch (e) {}
							}
						}}
					>
						{this.state.reacting ? "Reacting..." : "React"}
					</Button>
					{this.state.reacting ? (
						""
					) : (
						<Button
							onClick={closeModal}
							look={Button.Looks.LINK}
							color={Button.Colors.TRANSPARENT}
						>
							Cancel
						</Button>
					)}
				</Modal.Footer>
			</Modal>
		);
	}

	react = async () => {
		for (let i = 0; i < this.state.emojiData.emojis.length; i++) {
			let emoji = this.state.emojiData.emojis[i];
			if (this.state.message && !this.state.message.reactions?.find(r =>
				r?.emoji?.name == this.state.message.reactions[emoji] && r?.me
			)) {
				addReaction(
					this.state.message.channel_id,
					this.state.message.id,
					{
						name: this.state.emojiData.emojis[i],
					}
				);
				await new Promise((r) => setTimeout(r, 350)); // avoid ratelimit
			}
		}
	};

	generateEmojiArray = (string) => {
		string = string.toLowerCase();
		const message = this.state.message;
		let unusedReactions = JSON.parse(JSON.stringify(this.props.reactions));
		let allUnusedReactions = [];
		let incomplete = false;

		// Remove all reactions that have already need used.
		for (let i = 0; i < Object.keys(unusedReactions.multiple).length; i++) {
			let reactionName = Object.keys(unusedReactions.multiple)[i];
			let reactionValues = unusedReactions.multiple[reactionName];

			for (let j = 0; j < reactionValues.length; j++) {
				let reactionValue = reactionValues[j];

				for (let k = 0; k < message.reactions.length; k++) {
					let messageReactionName = message.reactions[k].emoji.name;
					if (reactionValue == messageReactionName) {
						unusedReactions.multiple[reactionName].splice(0, 1);
						j--;
						if (reactionValues.length == 0) {
							delete unusedReactions.multiple[reactionName];
							i--;
						}
					}
				}
			}
		}
		for (let i = 0; i < Object.keys(unusedReactions.single).length; i++) {
			let reactionName = Object.keys(unusedReactions.single)[i];
			let reactionValues = unusedReactions.single[reactionName];

			for (let j = 0; j < reactionValues.length; j++) {
				let reactionValue = reactionValues[j];

				for (let k = 0; k < message.reactions.length; k++) {
					let messageReactionName = message.reactions[k].emoji.name;
					if (reactionValue == messageReactionName) {
						unusedReactions.single[reactionName].splice(0, 1);
						j--;
						if (reactionValues.length == 0) {
							delete unusedReactions.single[reactionName];
							i--;
						}
					}
				}
			}
		}
		for (let i = 0; i < Object.keys(unusedReactions.multiple).length; i++) {
			let reactionName = Object.keys(unusedReactions.multiple)[i];
			let reactionValues = unusedReactions.multiple[reactionName];
			allUnusedReactions = allUnusedReactions.concat(reactionValues);
		}
		for (let i = 0; i < Object.keys(unusedReactions.single).length; i++) {
			let reactionName = Object.keys(unusedReactions.single)[i];
			let reactionValues = unusedReactions.single[reactionName];
			allUnusedReactions = allUnusedReactions.concat(reactionValues);
		}

		// Replace text with reactions.
		// No duplicate emojis.
		// Preferring multiple character long ones.
		const multiple = () => {
			for (
				let i = 0;
				i < Object.keys(unusedReactions.multiple).length;
				i++
			) {
				let reactionName = Object.keys(unusedReactions.multiple)[i];
				let reactionValues = unusedReactions.multiple[reactionName];

				while (
					unusedReactions.multiple[reactionName] &&
					string.indexOf(reactionName) > -1
				) {
					let oldString = string;
					string = string.replace(
						reactionName,
						">>TOKEN" + reactionValues[0] + ">>TOKEN"
					);
					if (string != oldString) {
						unusedReactions.multiple[reactionName].splice(0, 1);
						if (reactionValues.length == 0) {
							delete unusedReactions.multiple[reactionName];
							i--;
						}
					}
				}
			}
		};
		const single = () => {
			for (
				let i = 0;
				i < Object.keys(unusedReactions.single).length;
				i++
			) {
				let reactionName = Object.keys(unusedReactions.single)[i];
				let reactionValues = unusedReactions.single[reactionName];

				while (
					unusedReactions.single[reactionName] &&
					string.indexOf(reactionName) > -1
				) {
					let oldString = string;
					string = string.replace(
						reactionName,
						">>TOKEN" + reactionValues[0] + ">>TOKEN"
					);
					if (string != oldString) {
						unusedReactions.single[reactionName].splice(0, 1);
						if (reactionValues.length == 0) {
							delete unusedReactions.single[reactionName];
							i--;
						}
					}
				}
			}
		};

		if (this.state.preferMultiple) {
			multiple();
			single();
		} else {
			single();
			multiple();
		}

		// Remove all characters that aren't emojis.
		// If there are any, also mark the list as incomplete.
		let emojis = string
			.trim()
			.split(">>TOKEN")
			.filter(function (el) {
				return el != "";
			});
		for (let i = 0; i < emojis.length; i++) {
			let emoji = emojis[i];
			let isEmoji = false;
			for (let j = 0; j < allUnusedReactions.length && !isEmoji; j++) {
				if (emoji == allUnusedReactions[j]) {
					isEmoji = true;
				}
			}
			if (!isEmoji) {
				incomplete = true;
				emojis.splice(i, 1);
			}
		}
		return {
			emojis,
			incomplete,
		};
	};
}

module.exports = ReactionBuilderModal;
