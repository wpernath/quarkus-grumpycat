import { Stage, event, loader, game, state, Vector2d, Container, BitmapText, Rect, Sprite, input, ImageLayer, pool } from "melonjs/dist/melonjs.module.js";

import BaseTextButton from "../../util/base-text-button";

import { my_state } from "../../util/constants";
import { StateBackground } from "../state_background";

class StartGameButton extends BaseTextButton {
    constructor(x,y) {
        super(x,y, {
            text: "Host Game",
            borderWidth: 250,
            fillStyle: pool.pull("Color", 255,100,100),
        });   
    }

    onClick() {
        state.change(my_state.MULTIPLAYER_START_GAME);
    }
}

class JoinGameButton extends BaseTextButton {
	constructor(x, y) {
		super(x, y, {
			text: "Join Game",
			borderWidth: 250,
		});
	}

	onClick() {
		state.change(my_state.MULTIPLAYER_JOIN_GAME);
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
		this.addChild(new StateBackground("MULTIPLAYER"));
        this.addChild(new StartGameButton((game.viewport.width - 250)/2, 300));
        this.addChild(new JoinGameButton((game.viewport.width - 250) / 2, 360));
        this.addChild(new BackButton((game.viewport.width - 250) / 2, 420));        
	}

}

export default class MultiplayerMenuScreen extends Stage {
	onResetEvent() {
		this.menu = new MenuComponent();
		game.world.addChild(this.menu);

		this.handler = event.on(event.KEYDOWN, function (action, keyCode, edge) {
			if (!state.isCurrent(my_state.MULTIPLAYER_MENU)) return;
			if (action === "exit") {
				state.change(state.MENU);
			}
		});
	}

	onDestroyEvent() {
		event.off(event.KEYDOWN, this.handler);
		//input.unbindPointer(input.pointer.LEFT);
		game.world.removeChild(this.menu);
	}
}
