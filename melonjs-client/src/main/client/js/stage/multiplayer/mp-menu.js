import { Stage, event, loader, game, state, Vector2d, Container, BitmapText, Rect, Sprite, input, ImageLayer, pool } from "melonjs/dist/melonjs.module.js";

import BaseTextButton from "../../util/base-text-button";

import { my_state } from "../../util/constants";
import MultiplayerManager  from "../../util/multiplayer";
import { StateBackground } from "../state_background";
import GlobalGameState from "../../util/global-game-state";
import { BaseContainer } from "../../util/base-container";
import { TextInput } from "../../util/text-input";
import {bindKeys, unbindKeys} from "../../util/constants";

class ChangeNamePopup extends BaseContainer {
	constructor() {
		let h = 160;
		let w = 320;
		let x = (game.viewport.width - w) / 2;
		let y = 200;
		super(x, y, w, h, {
			titleText: "Change Name",
			titlePos: "left",
			backgroundAlpha: 0.9,
			dividerColor: "#005500"
		});
		let absPos = this.getAbsolutePosition();
		this.textInput = new TextInput(
			absPos.x + this.contentContainer.pos.x, 
			absPos.y + this.contentContainer.pos.y, 
			"text", 
			MultiplayerManager.get().multiplayerPlayer.name,
			32
		);
		this.addChild(this.textInput);
		unbindKeys();
	}
}

class StartGameButton extends BaseTextButton {
    constructor(x,y) {
        super(x,y, {
            text: "Host Game",
            borderWidth: 250,
            fillStyle: "#ff1000",
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

class ChangeNameButton extends BaseTextButton {
	constructor(x,y) {
		super(x, y, {
			text: "Change Name",
			borderWidth: 250
		})
	}

	onClick() {
		this.window = new ChangeNamePopup();
		this.ancestor.addChild(this.window);
		return false;
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
		this.addChild(new StateBackground("MULTIPLAYER", true, true, true));
        this.addChild(new StartGameButton((game.viewport.width - 250)/2, 300));
        this.addChild(new JoinGameButton((game.viewport.width - 250) / 2, 360));
		this.addChild(new ChangeNameButton((game.viewport.width - 250) / 2, 420));
        this.addChild(new BackButton((game.viewport.width - 250) / 2, 480));        		
	}
}

export default class MultiplayerMenuScreen extends Stage {
	onResetEvent() {
		this.multiplayerManager = MultiplayerManager.get();
		this.menu = null;
		GlobalGameState.reset();

		this.multiplayerManager.createPlayerFromMe().then((player) => {			
			console.log("  Got new MultiPlayer: " + player.id);			
			this.menu = new MenuComponent();
			game.world.addChild(this.menu);

			this.handler = event.on(event.KEYUP, function (action, keyCode, edge) {
				if (!state.isCurrent(my_state.MULTIPLAYER_MENU)) return;
				if (action === "exit") {
					state.change(state.MENU);
				}
			});
		})
		.catch( (err) => {
			console.log("ERROR: " + err);
			state.change(state.MENU);
		});

	}

	onDestroyEvent() {
		event.off(event.KEYUP, this.handler);		
		if( this.menu !== null ) game.world.removeChild(this.menu);
		this.menu = null;
	}
}
