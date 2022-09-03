import { Stage, event, game, state, Container, BitmapText, Rect } from "melonjs";
import PlayerEntity from "../../renderables/player";
import BaseTextButton from "../../util/base-text-button";
import { my_state, PLAYER_COLORS } from "../../util/constants";
import MultiplayerManager, { MultiplayerMessage } from "../../util/multiplayer";
import { StateBackground } from "../state_background";
import {BaseContainer} from "../../util/base-container";

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
		console.log("**** onClick() ****")
		MultiplayerManager.get().startGame()
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
			if(MultiplayerManager.get().multiplayerPlayer.id == player.id ){
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

class MessageContainer extends BaseContainer {
	constructor(x, y, w, h, status ) {
		super(x, y, w, h, {
			titleText: "Status:",
			titleColor: "#ffa000",
			titlePos: "left",
			backgroundAlpha: 0.3,
			backgroundColor: "#005500",
		});

		this.statusMessage = new BitmapText(this.contentContainer.pos.x, this.contentContainer.pos.y, {
			font: "18Outline",						
		});

		this.addChild(this.statusMessage);
		this.updateMessage(status);
	}

	updateMessage(text) {
		this.statusMessage.setText(text);
	}
}

class PlayerContainer extends BaseContainer {
	constructor(x, y, w) {
		super(x, y, w, 224, {
			titleText: "Players in the Game",
			titleColor: "#ffa000",
			titlePos: "left",
			backgroundAlpha: 0.1,
			backgroundColor: "#101010",
		});

		this.playerComponents = [];
	}

	addPlayer(player, num) {
		let pe = new PlayerEntry(this.contentContainer.pos.x, this.contentContainer.pos.y + (num * 42), player, num);					
		this.playerComponents.push(pe);
		this.addChild(pe, 100);
	}

	updatePlayer(player, num) {
		let pe = this.playerComponents[num];
		pe.updatePlayer(player);
	}
}

class MenuComponent extends Container {
	constructor() {
		super();

		// make sure we use screen coordinates
		this.floating = true;
		this.setOpacity(1.0);

		// always on toppest
		this.z = 20;
		
		this.players = [];		
		this.startButton = new StartGameButton(game.viewport.width - 155, game.viewport.height - 60);
		this.addChild(this.startButton);

		let w = 600;
		let h = 100;
		let x = ( game.viewport.width - w ) / 2;
		let y = 236;
		this.statusContainer = new MessageContainer(x, y, w, h, "Waiting........");		
		this.addChild(this.statusContainer);

		this.playerContainer = new PlayerContainer(x, y + h + 8, w);
		this.addChild(this.playerContainer);

		this.players = this.playersFromGame(MultiplayerManager.get().multiplayerGame);
		for (let i = 0; i < 4; i++) {		
			this.playerContainer.addPlayer(this.players[i], i);			
		}

		// give a name
		this.name = "mp-lobby";
		this.addChild(new StateBackground("LOBBY", false, false, true));
		this.addChild(new BackButton(5, game.viewport.height - 60));

		MultiplayerManager.get().setOnJoinCallback(this.playerJoined.bind(this));
		MultiplayerManager.get().setOnLeaveCallback(this.playerLeft.bind(this));
		MultiplayerManager.get().setOnGameCloseCallback(this.gameClosed.bind(this));
		MultiplayerManager.get().setOnBroadcastCallback(this.broadcasted.bind(this));
		MultiplayerManager.get().setOnGameStartedCallback(this.gameStarted.bind(this));
		
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
		this.players = this.playersFromGame(MultiplayerManager.get().multiplayerGame);
		for (let i = 0; i < 4; i++) {
			this.playerContainer.updatePlayer(this.players[i], i);
		}
	}


	// event handlers
	gameStarted(event) {
		let message = event.message;
		this.statusContainer.updateMessage("Game starting now!");
		state.change(my_state.MULTIPLAYER_PLAY);
	}

	playerJoined(event) {
		let message = event.message;
		let theGame = event.game;
		this.statusContainer.updateMessage(message.message);
		if( MultiplayerManager.get().weAreHost ) {
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

		this.statusContainer.updateMessage(message.message);
		if( MultiplayerManager.get().weAreHost ) {
			if ((this.startButton !== null && theGame.player1 !== undefined) || theGame.player2 === undefined || theGame.player3 === undefined || theGame.player4 === undefined) {
				//this.removeChild(this.startButton);				
				//this.startButton = null;
			}
		}
		this.updatePlayers(theGame);
	}

	gameClosed(event) {
		MultiplayerManager.get().closeActiveGame()
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
				MultiplayerManager.get().closeActiveGame();
				state.change(my_state.MULTIPLAYER_MENU);
			}
		});
	}

	onDestroyEvent() {
		event.off(event.KEYUP, this.handler);		
		game.world.removeChild(this.menu);

		// make sure dead components won't get notified on changes
		MultiplayerManager.get().setOnJoinCallback(null);
		MultiplayerManager.get().setOnLeaveCallback(null);
		MultiplayerManager.get().setOnGameCloseCallback(null);
		MultiplayerManager.get().setOnBroadcastCallback(null);
		MultiplayerManager.get().setOnGameStartedCallback(null);

	}
}
