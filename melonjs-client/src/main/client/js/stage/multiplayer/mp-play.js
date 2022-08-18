import { Stage, game, event, state, level, pool } from "melonjs";
import MultiplayerManager from "../../util/multiplayer";
import CatEnemy from "../../renderables/cat-enemy.js";
import { SpiderEnemy } from "../../renderables/spider-enemy.js";
import GolemEnemySprite from "../../renderables/golem-enemy";

import HUDContainer from "../hud/hud-container.js";
import VirtualJoypad from "../hud/virtual-joypad.js";

import { my_state, PLAYER_COLORS } from "../../util/constants";
import { MPRemotePlayerSprite } from "../../renderables/multiplayer/mp-player";
import { MPLocalPlayerSprite } from "../../renderables/multiplayer/mp-local-player";


export default class MultiplayerPlayScreen extends Stage {
	player = null;
	players = [];

    remotePlayers = [];
	enemies = [];
	hudContainer = null;
	virtualJoypad = null;
	isActive = false;
	spriteLayer = 6;
	currentLevel = null;

	enemyEmitter = {
		isActive: false,
		emitAt: {
			x: 0,
			y: 0,
		},
		emitEvery: 5000, // ms
		emitTime: 5000,
		emitCount: 10,
	};

	onResetEvent() {
        console.log("mp-play.OnEnter()");
		this.isActive = false;
		this.players = [];
        this.player = null;
		this.enemies = [];
		this.enemyEmitter.isActive = false;
        this.remotePlayers = [];

        this.players = this.playersFromGame(MultiplayerManager.getInstance().multiplayerGame);        
		for( let x = 0; x < this.players.length; x++) {
			let p = this.players[x];
			if( p !== null ) {
            	console.log("Player " + x + ": " + p.name);
			}
		}
		this.setupLevel();

		this.hudContainer = new HUDContainer(0, 0);
		this.virtualJoypad = new VirtualJoypad();
		game.world.addChild(this.hudContainer);
		game.world.addChild(this.virtualJoypad, Infinity);


		this.handler = event.on(event.KEYUP, function (action, keyCode, edge) {
			if (!state.isCurrent(my_state.MULTIPLAYER_PLAY)) return;
			if (action === "exit") {
                this.cleanupWorld();
                
                // send player left message to others
                MultiplayerManager.getInstance().closeActiveGame();
			}
		});

		MultiplayerManager.getInstance().setOnGameOverCallback( (message) => {
			this.isActive = false;
            this.cleanupWorld();
			state.change(my_state.MULTIPLAYER_GAME_OVER);
		}, this);

        MultiplayerManager.getInstance().setOnLeaveCallback( (message, data) => {
            // check to see which player we have to remove now
            for( let i = 0; i < this.remotePlayers.length; i++ ) {
                let rp = this.remotePlayers[i];
                if( rp.player.id === message.playerId) {
                    game.world.removeChild(rp);
                    this.remotePlayers[i] = null;
                }
            }
        }, this)
		this.isActive = true;
	}

    cleanupWorld() {
        this.isActive = false;
        if (this.player !== null) game.world.removeChild(this.player);
        for (let i = 0; i < this.remotePlayers.length; i++) {
            if( this.remotePlayers[i] !== null ) {
                game.world.removeChild(this.remotePlayers[i]);
                this.remotePlayers[i] = null;
            }
        }

        for (let i = 0; i < this.enemies.length; i++) {
            game.world.removeChild(this.enemies[i]);
            this.enemies[i] = null;
        }

        this.player = null;
        this.remotePlayers = [];
        this.enemies = [];
    }


	playersFromGame(theGame) {
		let players = [];
		players[0] = theGame.player1 !== undefined ? theGame.player1 : null;
		players[1] = theGame.player2 !== undefined ? theGame.player2 : null;
		players[2] = theGame.player3 !== undefined ? theGame.player3 : null;
		players[3] = theGame.player4 !== undefined ? theGame.player4 : null;
		return players;
	}

	update(dt) {
		if (!this.isActive) return super.update(dt);
		if (this.enemyEmitter.isActive && this.enemyEmitter.emitEvery <= 0 && this.enemyEmitter.emitCount > 0) {
			// emit a new spider
			this.enemyEmitter.emitCount--;
			this.enemyEmitter.emitEvery = this.enemyEmitter.emitTime;
			let spider = new SpiderEnemy(this.enemyEmitter.emitAt.x, this.enemyEmitter.emitAt.y, false);
			spider.setEnemyName("SpiderEnemy." + (this.enemyEmitter.emitCount + 1));
			this.enemies.push(spider);
			game.world.addChild(spider, this.spriteLayer);
			spider.setPlayer(this.player);
		}

		this.enemyEmitter.emitEvery -= dt;

		let dirty = super.update(dt);
		return dirty;
	}

	setupLevel() {
		this.multiplayerGame = MultiplayerManager.getInstance().multiplayerGame;
		this.currentLevel = MultiplayerManager.getInstance().allLevels()[this.multiplayerGame.level];
		this.currentLevel.loadIntoMelon();
		level.load(this.currentLevel.id);

		let layers = level.getCurrentLevel().getLayers();
		let layerNum = 0;
        let playerNum = 0;
		layers.forEach((l) => {
			console.log(l.name);
			if (l.name === "Persons") {
				let enemynum = 0;
				this.spriteLayer = layerNum;
				for (let y = 0; y < l.height; y++) {
					for (let x = 0; x < l.width; x++) {
						let tile = l.cellAt(x, y);
						if (tile !== null && tile !== undefined) {
							if (tile.tileId === 993) {
                                if( playerNum < PLAYER_COLORS.length ) {
                                    if( this.players[playerNum] !== null ) {
                                        let color = PLAYER_COLORS[playerNum];
                                        let playerObject = this.players[playerNum];

                                        if( playerObject.id === MultiplayerManager.getInstance().multiplayerPlayer.id ) {
                                            // this player will be controlled by us
                                            this.player = new MPLocalPlayerSprite(x,y, playerObject, color);
                                            game.world.addChild(this.player, this.spriteLayer);
                                            this.player.name = playerObject.name;

                                            console.log("  local player at (" + x + "/" + y + "): " + this.player.name);
                                        }
                                        else {
                                            // this player will be controlled by someone else
                                            let remotePlayer = new MPRemotePlayerSprite(x, y, playerObject, color);
                                            remotePlayer.name = playerObject.name;
                                            this.remotePlayers.push(remotePlayer);
                                            game.world.addChild(remotePlayer, this.spriteLayer);
                                            console.log("  remote player at (" + x + "/" + y + "): " + remotePlayer.name);
                                        }                                    
                                    }
                                }
                                playerNum++;
							} 
                            else if (tile.tileId === 994) {
								let enemy = new CatEnemy(x, y, false);
								let name = "CatEnemy." + enemynum++;
								enemy.setEnemyName(name);
								game.world.addChild(enemy, this.spriteLayer);
								this.enemies.push(enemy);
								console.log("  enemy at (" + x + "/" + y + "): " + enemy);
							} 
                            else if (tile.tileId === 995) {
								// create a spider emitter, which emits up to X spiders every
								// 10 seconds
								this.enemyEmitter.isActive = true;
								this.enemyEmitter.emitAt.x = x;
								this.enemyEmitter.emitAt.y = y;
								this.enemyEmitter.emitCount = l.enemyNumEmitting;
								this.enemyEmitter.emitEvery = l.enemyTimeEmitting;
								console.log("  enemyEmitter at (" + x + "/" + y + "): ");
							} 
                            else if (tile.tileId === 996) {
								let enemy = new GolemEnemySprite(x, y, false);
								let name = "Golem." + (enemynum + 1);
								enemynum++;
								enemy.setEnemyName(name);
								enemy.setWayPath(this.currentLevel.getPathForEnemy(name));

								game.world.addChild(enemy, this.spriteLayer);
								this.enemies.push(enemy);
								console.log("  enemy at (" + x + "/" + y + "): " + enemy);
							}
						}
					}
				}
			}
			layerNum++;
		});

		// make sure, all enemies know the player
		this.enemies.forEach((e) => e.setPlayer(this.player));
	}

	onDestroyEvent() {
		console.log("MP-Play.OnExit()");
		this.isActive = false;
		game.world.removeChild(this.hudContainer);
		game.world.removeChild(this.virtualJoypad);
		event.off(event.KEYUP, this.handler);
		
        // make sure everything is removed!
        this.cleanupWorld();
        game.world.reset();

		// make sure dead components won't get notified on changes
		MultiplayerManager.getInstance().setOnJoinCallback(null);
		MultiplayerManager.getInstance().setOnLeaveCallback(null);
		MultiplayerManager.getInstance().setOnGameCloseCallback(null);
		MultiplayerManager.getInstance().setOnBroadcastCallback(null);
		MultiplayerManager.getInstance().setOnGameStartedCallback(null);
        MultiplayerManager.getInstance().addOnMessageCallback(null);
	}
}
