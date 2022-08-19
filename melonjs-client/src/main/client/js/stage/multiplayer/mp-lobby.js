import { Stage, event, game, state, Container, BitmapText, Rect } from "melonjs";
import PlayerEntity from "../../renderables/player";
import BaseTextButton from "../../util/base-text-button";
import { my_state, PLAYER_COLORS } from "../../util/constants";
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
		console.log("**** onClick() ****")
		MultiplayerManager.getInstance().startGame()
			.then(() => {
				state.change(my_state.MULTIPLAYER_PLAY);
			});	
	}
}

class PlayerEntry extends Container {
	constructor(x, y, player, num) {
		super(x,y);
		this.player = player;
		this.playerNum = num;		


		this.playerNumText = new BitmapText(40, 4, {
			font: "24Outline",
			text: "Player " + (num+1) + ":",
		});

		this.playerNameText = new BitmapText(160, 4, {
			font: "24Outline",			
		});

		this.sprite = new PlayerEntity(0, 0, true);
		this.sprite.tint = PLAYER_COLORS[num];

		this.updatePlayer(player);
		this.addChild(this.playerNumText);
		this.addChild(this.playerNameText);	
		this.addChild(this.sprite);	
	}

	updatePlayer(player) {
		this.player = player;
		if( player !== null ) {
			this.playerNameText.setText(player.name);
			if(MultiplayerManager.getInstance().multiplayerPlayer.id == player.id ){
				this.playerNameText.fillStyle = "#00ffa0";
				this.playerNameText.setText(player.name + " (you)");
			}
			else {
				this.playerNameText.fillStyle = "#ffffff";
				this.playerNameText.setText(player.name);
			}
		}
		else {
			this.playerNameText.fillStyle = "#ffffff";
			this.playerNameText.setText("waiting...");
		}
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
		
		this.players = [];
		this.playerComponents = [];
		this.startButton = null;


		this.addChild(new BitmapText(126, 250, {
			font: "18Outline",
			fillStyle: "#ffa000",
			text: "Status:"
		}));

		
		this.statusMessage = new BitmapText(126, 276, {
			font: "12Outline",
			text: "Waiting..."
		});

		this.addChild(this.statusMessage);

		// give a name
		this.name = "mp-lobby";
		this.addChild(new StateBackground("LOBBY", false, false));
		this.addChild(
			new BitmapText(game.viewport.width - 75, 170, {
				font: "24Outline",
				textAlign: "right",
				text: MultiplayerManager.getInstance().multiplayerPlayer.name,
			})
		);

		this.addChild(new BackButton(5, game.viewport.height - 60));

		MultiplayerManager.getInstance().setOnJoinCallback(this.playerJoined.bind(this));
		MultiplayerManager.getInstance().setOnLeaveCallback(this.playerLeft.bind(this));
		MultiplayerManager.getInstance().setOnGameCloseCallback(this.gameClosed.bind(this));
		MultiplayerManager.getInstance().setOnBroadcastCallback(this.broadcasted.bind(this));
		MultiplayerManager.getInstance().setOnGameStartedCallback(this.gameStarted.bind(this));
		
		this.players = this.playersFromGame(MultiplayerManager.getInstance().multiplayerGame);
		for( let i = 0; i < 4; i++ ) {
			let pe = new PlayerEntry(130, 330 + i * 42, this.players[i], i);
			this.playerComponents.push(pe);
			this.addChild(pe);
		}
	}

	playersFromGame(theGame) {
		let players = [];
		players[0] = theGame.player1 !== undefined? theGame.player1 : null;
		players[1] = theGame.player2 !== undefined ? theGame.player2 : null;
		players[2] = theGame.player3 !== undefined ? theGame.player3 : null;
		players[3] = theGame.player4 !== undefined ? theGame.player4 : null;
		return players;
	}

	updatePlayers(theGame) {
		this.players = this.playersFromGame(MultiplayerManager.getInstance().multiplayerGame);
		for (let i = 0; i < 4; i++) {
			let pe = this.playerComponents[i];
			pe.updatePlayer(this.players[i]);
		}
	}


	// event handlers
	gameStarted(event) {
		let message = event.message;
		this.statusMessage.setText("Game starting now!");
		state.change(my_state.MULTIPLAYER_PLAY);
	}

	playerJoined(event) {
		let message = event.message;
		let theGame = event.game;
		this.statusMessage.setText(message.message);
		if( MultiplayerManager.getInstance().weAreHost ) {
			if( this.startButton === null ) {
				this.startButton = new StartGameButton(game.viewport.width - 105, game.viewport.height - 60);			
				this.addChild(this.startButton);
			}			
		}
		this.updatePlayers(theGame);
	}

	playerLeft(event) {
		let message = event.message;
		let theGame = event.game;

		this.statusMessage.setText(message.message);
		if( MultiplayerManager.getInstance().weAreHost ) {
			if ((this.startButton !== null && theGame.player1 !== undefined) || theGame.player2 === undefined || theGame.player3 === undefined || theGame.player4 === undefined) {
				this.removeChild(this.startButton);				
				this.startButton = null;
			}
		}
		this.updatePlayers(theGame);
	}

	gameClosed(event) {
		MultiplayerManager.getInstance().closeActiveGame()
			then( () => {
				state.change(my_state.MULTIPLAYER_MENU);
			});
	}

	broadcasted(event) {
		let message = event.message;
		this.statusMessage.setText(message.message);
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

		// make sure dead components won't get notified on changes
		MultiplayerManager.getInstance().setOnJoinCallback(null);
		MultiplayerManager.getInstance().setOnLeaveCallback(null);
		MultiplayerManager.getInstance().setOnGameCloseCallback(null);
		MultiplayerManager.getInstance().setOnBroadcastCallback(null);
		MultiplayerManager.getInstance().setOnGameStartedCallback(null);

	}
}
