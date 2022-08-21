import { Stage, event, loader, game, state, Vector2d, Container, BitmapText, Rect, Sprite, input, ImageLayer, pool } from "melonjs/dist/melonjs.module.js";

import BaseTextButton from "../../util/base-text-button";

import { my_state } from "../../util/constants";
import MultiplayerManager  from "../../util/multiplayer";
import { StateBackground } from "../state_background";
import GlobalGameState from "../../util/global-game-state";

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

		this.addChild(new BitmapText(game.viewport.width-75, 170, {
			font: "24Outline",
			textAlign: "right",
			text: MultiplayerManager.get().multiplayerPlayer.name 
		}));
        this.addChild(new StartGameButton((game.viewport.width - 250)/2, 300));
        this.addChild(new JoinGameButton((game.viewport.width - 250) / 2, 360));
        this.addChild(new BackButton((game.viewport.width - 250) / 2, 420));        		
	}
}

export default class MultiplayerMenuScreen extends Stage {
	onResetEvent() {
		this.multiplayerManager = MultiplayerManager.get();
		this.menu = null;
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
