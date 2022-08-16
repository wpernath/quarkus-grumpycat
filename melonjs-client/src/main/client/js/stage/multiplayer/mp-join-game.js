import { Stage, event, game, state, Container, BitmapText } from "melonjs";
import BaseTextButton from "../../util/base-text-button";
import { my_state } from "../../util/constants";
import { StateBackground } from "../state_background";
import MultiplayerManager from "../../util/multiplayer";
import { GameChooserComponent } from "./mp-choose-game";
class BackButton extends BaseTextButton {
	constructor(x, y) {
		super(x, y, {
			text: "Back",
			borderWidth: 100,
		});
	}

	onClick() {
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
		this.addChild(new StateBackground("JOIN GAME", false, false));
		this.addChild(
			new BitmapText(game.viewport.width - 75, 170, {
				font: "24Outline",
				textAlign: "right",
				text: MultiplayerManager.getInstance().multiplayerPlayer.name,
			})
		);

		this.addChild(new BackButton(5, game.viewport.height - 60));


		MultiplayerManager.getInstance()
			.listOpenGames()
			.then((games) => {
				this.gameChooser = new GameChooserComponent(games);
				this.addChild(this.gameChooser);
			})
			.catch( (err) => {
				console.log("  ERROR can't read open games: " +err);
				state.change(my_state.MULTIPLAYER_MENU);
			});

	}
}

export default class JoinGameScreen extends Stage {
	onResetEvent() {
		this.menu = new MenuComponent();
		game.world.addChild(this.menu);

		this.handler = event.on(event.KEYUP, function (action, keyCode, edge) {
			if (!state.isCurrent(my_state.MULTIPLAYER_JOIN_GAME)) return;
			if (action === "exit") {
				state.change(my_state.MULTIPLAYER_MENU);
			}
		});
	}

	onDestroyEvent() {
		event.off(event.KEYUP, this.handler);
		//input.unbindPointer(input.pointer.LEFT);
		game.world.removeChild(this.menu);
	}
}
