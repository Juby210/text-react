const {
	React,
	getModule,
	getModuleByDisplayName,
} = require("powercord/webpack");
const { open: openModal } = require("powercord/modal");
const Tooltip = getModuleByDisplayName("Tooltip", false);
const ReactionBuilderModal = require("./ReactionBuilderModal");
const classes = {
	...getModule(["icon", "isHeader"], false),
};

module.exports = ({ Button }) =>
	class TextReactButton extends React.Component {
		render() {
			if (!Button) return null;
			return (
				<Tooltip color="black" postion="top" text="Text React">
					{({ onMouseLeave, onMouseEnter }) => (
						<Button
							className={`text-react-button`}
							onClick={() => {
								setTimeout(() => {
									openModal(() => (
										<ReactionBuilderModal
											channel={this.props.channel}
											message={this.props.message}
											reactions={this.props.reactions}
											allReactions={
												this.props.allReactions
											}
										/>
									));
								}, 0);
							}}
							onMouseEnter={onMouseEnter}
							onMouseLeave={onMouseLeave}
						>
							<img
								className={`emoji ${classes.icon}`}
								src="/assets/bbe8ae762f831966587a35010ed46f67.svg"
							/>
						</Button>
					)}
				</Tooltip>
			);
		}
	};
