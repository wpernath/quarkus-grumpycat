import { BitmapText, input, timer, game, Container, Vector2d, Text, RoundRect, state, Rect } from "melonjs/dist/melonjs.module.js";
import BaseTextButton from "../util/base-text-button";
import { my_state } from "../util/constants";
import GlobalGameState from "../util/global-game-state";



class PlayButton extends BaseTextButton {
	constructor(x, y, ) {
		super(x, y, {
			text: 'Play',			
			borderWidth: 250
		});		
	}

	onClick(event) {
		state.change(state.READY);
	}
}

class LevelChooserButton extends BaseTextButton {
	constructor(x,y) {
		super(x,y, {
			text: "Choose Level",
			borderWidth: 250,
		});
	}

	onClick(event) {
		state.change(my_state.CHOOSE_LEVEL)
	}
}
class ReplayButton extends BaseTextButton {
	constructor(x, y) {
		super(x, y, {
			text: "Replay",
			borderWidth: 250,
		});
	}

	onClick(event) {
		state.change(my_state.REPLAY_GAME_CHOOSER);
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
		this.addChild(new PlayButton(center, 300));
		this.addChild(new LevelChooserButton(center, 360));
		this.addChild(new ReplayButton(center, 420));		
		this.addChild(new HighscoreButton(center, 480));
	}
}
