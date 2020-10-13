const {
	React,
	getModule,
	getModuleByDisplayName,
} = require("powercord/webpack");
const {
	Divider,
	FormTitle,
	settings: { TextInput, SwitchItem },
} = require("powercord/components");
const { close: closeModal } = require("powercord/modal");
const Reactions = getModuleByDisplayName("Reactions", false);
const margins = getModule(["marginTop20"], false);

class Form extends React.PureComponent {
	render() {
		if (!this.props.message) {
			closeModal()
			return null
		}
		return (
			<React.Fragment>
				<FormTitle tag="h5">Reaction Text</FormTitle>
				<TextInput
					autoFocus
					note="Example: emmaiscute"
					error={this.props.error}
					value={this.props.text}
					onInput={(event) => {
						this.props.update(event.target.value);
					}}
					onKeyDown={async (event) => {
						switch (event.keyCode) {
							case 13:
								if (!this.props.reacting) {
									this.props.setReacting(true);
									await this.props.react(
										this.props.emojiData
									);
									try {
										closeModal();
									} catch (e) {}
								}
								break;
							case 27:
								try {
									closeModal();
								} catch (e) {}
						}
					}}
				/>
				<SwitchItem
					children={["Prefer Multiple Character Emojis"]}
					note="Whether or not to use combined character emojis first."
					value={this.props.preferMultiple}
					onChange={(event) => {
						this.props.setPreferMultiple(event.target.checked);
					}}
				/>
				<FormTitle tag="h5" className={margins.marginTop8}>
					Preview
				</FormTitle>
				<div className="text-react-no-click">
					{this.props.message.reactions.length > 0 ||
					this.props.emojiData.emojis ? (
						<Preview
							channel={this.props.channel}
							message={this.props.message}
							emojiData={this.props.emojiData}
							reacting={this.props.reacting}
							update={this.props.update}
						/>
					) : (
						""
					)}
				</div>
				<Divider />
				<FormTitle tag="h5" className={margins.marginTop8}>
					Current Message Reactions
				</FormTitle>
				{this.props.message.reactions.length > 0 ? (
					<Reactions
						channel={this.props.channel}
						message={this.props.message}
						disableReactionCreates={false}
						disableReactionUpdates={false}
						isLurking={false}
					/>
				) : (
					<br />
				)}
				<br />
				<br />
			</React.Fragment>
		);
	}
}

class Preview extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			lastReactions: [],
		};
	}

	render() {
		let reactions = [];
		if (this.props.emojiData.emojis) {
			for (let i = 0; i < this.props.emojiData.emojis.length; i++) {
				reactions.push({
					count: 1,
					me: true,
					emoji: {
						id: null,
						name: this.props.emojiData.emojis[i],
					},
				});
			}
		}

		let channel = this.props.channel;
		let message = JSON.parse(JSON.stringify(this.props.message));

		message.reactions = message.reactions.concat(reactions);

		if (message.reactions.length != this.state.lastReactions.length && !this.props.reacting) {
			this.setState({
				lastReactions: message.reactions,
			});
			this.props.update();
		}

		return (
			<Reactions
				channel={channel}
				message={message}
				disableReactionCreates={true}
				disableReactionUpdates={false}
				isLurking={false}
			/>
		);
	}
}

module.exports = Form;
