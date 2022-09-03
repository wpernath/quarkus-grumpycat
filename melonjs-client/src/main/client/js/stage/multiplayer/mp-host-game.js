import { Stage, event, game, state, Container, BitmapText } from "melonjs";
import BaseTextButton from "../../util/base-text-button";
import { my_state } from "../../util/constants";
import GlobalGameState from "../../util/global-game-state";
import MultiplayerManager from "../../util/multiplayer";
import { StateBackground } from "../state_background";
import { ChooserComponent } from "./mp-choose-level";

class BackButton extends BaseTextButton {
	constructor(x, y) {
		super(x, y, {
			text: "Back",
			borderWidth: 150,
		});
	}

	onClick() {
		MultiplayerManager.get().closeActiveGame();
		state.change(my_state.MULTIPLAYER_MENU);
	}
}

class StartGameButton extends BaseTextButton {
	constructor(x, y) {
		super(x, y, {
			text: "Start",
			borderWidth: 150,
		});
	}

	onClick() {
		MultiplayerManager.get().createGame().then( (game) => {
			state.change(my_state.MULTIPLAYER_LOBBY);
		});		
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

		this.levelChooser = new ChooserComponent(MultiplayerManager.get().allLevels());
        this.addChild(new StateBackground("HOST GAME", false, false, true));
		this.addChild(this.levelChooser);

		this.addChild(new BackButton(5, game.viewport.height - 60));
        //this.addChild(new StartGameButton(game.viewport.width - 155, game.viewport.height - 60));
	}
}

export default class HostGameScreen extends Stage {
	onResetEvent() {
		this.menu = new MenuComponent();
		game.world.addChild(this.menu);


		this.handler = event.on(event.KEYUP, function (action, keyCode, edge) {
			if (!state.isCurrent(my_state.MULTIPLAYER_START_GAME)) return;
			if (action === "exit") {
				MultiplayerManager.get().closeActiveGame();
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