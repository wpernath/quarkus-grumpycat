import { Stage, event, loader, game, state, Vector2d, Container, BitmapText, Rect, Sprite, input, ImageLayer, pool } from "melonjs/dist/melonjs.module.js";

import BaseTextButton from "../util/base-text-button";

import { my_state } from "../util/constants";
import { StateBackground } from "./state_background";

class PlayButton extends BaseTextButton {
	constructor(x, y) {
		super(x, y, {
			text: "Play",
			borderWidth: 250,
		});
	}

	onClick(event) {
		state.change(state.READY);
	}
}

class LevelChooserButton extends BaseTextButton {
	constructor(x, y) {
		super(x, y, {
			text: "Choose Level",
			borderWidth: 250,
		});
	}

	onClick(event) {
		state.change(my_state.CHOOSE_LEVEL);
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

class BackButton extends BaseTextButton {
	constructor(x, y) {
		super(x, y, {
			text: "Back",
			borderWidth: 250,
		});
	}

    onClick() {
        state.change(state.MENU);
    }
}


class MenuComponent extends Container {

	constructor() {
		super();

		// make sure we use screen coordinates
		this.floating = true;

		// always on toppest
		this.z = 10;

		this.setOpacity(1.0);

		// give a name
		this.name = "TitleBack";

		this.addChild(new StateBackground("SINGLE PLAYER"));
		let center = Math.round((game.viewport.width - 250) / 2);
        this.addChild(new PlayButton(center, 300));
        this.addChild(new ReplayButton(center, 360));
		this.addChild(new LevelChooserButton(center, 420));
        this.addChild(new BackButton(center, 480));        
	}

}

export default class SingleplayerMenuScreen extends Stage {
	onResetEvent() {
		this.menu = new MenuComponent();
		game.world.addChild(this.menu);

		this.handler = event.on(event.KEYUP, function (action, keyCode, edge) {
			if (!state.isCurrent(my_state.SINGLE_PLAYER_MENU)) return;
			if (action === "exit") {
				state.change(state.MENU);
			}
		});
	}

	onDestroyEvent() {
		event.off(event.KEYUP, this.handler);
		//input.unbindPointer(input.pointer.LEFT);
		game.world.removeChild(this.menu);
	}
}
