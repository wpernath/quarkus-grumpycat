import { BitmapText, input, timer, game, Container, Vector2d, Text, RoundRect, state, Rect } from "melonjs/dist/melonjs.module.js";
import BaseTextButton from "../util/base-text-button";
import { my_state } from "../util/constants";
import GlobalGameState from "../util/global-game-state";



class SinglePlayerButton extends BaseTextButton {
	constructor(x, y) {
		super(x, y, {
			text: "Single Player",
			borderWidth: 250,
		});
	}

	onClick(event) {
		state.change(my_state.SINGLE_PLAYER_MENU);
	}
}
class MultiplayerButton extends BaseTextButton {
	constructor(x,y) {
		super(x,y, {
			text: "Multi Player",
			borderWidth: 250
		});
	}

	onClick(event) {
		state.change(my_state.MULTIPLAYER_MENU);
	}
}
class HighscoreButton extends BaseTextButton {
	constructor(x, y) {
		super(x, y, {
			text: "Highscores",		
			borderWidth: 250,
		});
	}

	onClick(event) {
		state.change(state.SCORE);
	}
}

export default class TitleMenu extends Container {
	constructor() {
		super(0, 0);

		// make sure we use screen coordinates
		this.floating = true;

		// always on toppest
		this.z = 100;

		this.setOpacity(1.0);

		// give a name
		this.name = "TitleMenu";

		let center = Math.round((game.viewport.width - 250) / 2);
		this.addChild(new SinglePlayerButton(center, 300));
		this.addChild(new MultiplayerButton(center, 360));
		this.addChild(new HighscoreButton(center, 420));
	}
}
