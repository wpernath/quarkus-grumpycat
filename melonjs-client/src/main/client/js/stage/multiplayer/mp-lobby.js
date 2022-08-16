import { Stage, event, game, state, Container, BitmapText } from "melonjs";
import BaseTextButton from "../../util/base-text-button";
import { my_state } from "../../util/constants";
import MultiplayerManager from "../../util/multiplayer";
import { StateBackground } from "../state_background";

class BackButton extends BaseTextButton {
	constructor(x, y) {
		super(x, y, {
			text: "Back",
			borderWidth: 100,
		});
	}

	onClick() {
		MultiplayerManager.getInstance().closeActiveGame();
		state.change(my_state.MULTIPLAYER_MENU);
	}
}

class StartGameButton extends BaseTextButton {
	constructor(x, y) {
		super(x, y, {
			text: "Start",
			borderWidth: 100,
		});
	}

	onClick() {
		state.change(my_state.MULTIPLAYER_LOBBY);
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
		this.addChild(new StateBackground("LOBBY", false, false));
		this.addChild(
			new BitmapText(game.viewport.width - 75, 170, {
				font: "24Outline",
				textAlign: "right",
				text: MultiplayerManager.getInstance().multiplayerPlayer.name,
			})
		);

		this.addChild(new BackButton(5, game.viewport.height - 60));
	}
}

export default class MultiplayerLobbyScreen extends Stage {
	onResetEvent() {
		this.menu = new MenuComponent();
		game.world.addChild(this.menu);

		this.handler = event.on(event.KEYUP, function (action, keyCode, edge) {
			if (!state.isCurrent(my_state.MULTIPLAYER_LOBBY)) return;
			if (action === "exit") {
				MultiplayerManager.getInstance().closeActiveGame();
				state.change(my_state.MULTIPLAYER_MENU);
			}
		});
	}

	onDestroyEvent() {
		event.off(event.KEYUP, this.handler);		
		game.world.removeChild(this.menu);
	}
}
