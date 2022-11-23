import { Stage, game, event, state, level, pool, BitmapText } from "melonjs/dist/melonjs.module.js";
import MultiplayerManager, { MultiplayerMessageType } from "../../util/multiplayer";
import CatEnemy from "../../renderables/cat-enemy.js";
import { SpiderEnemy } from "../../renderables/spider-enemy.js";
import GolemEnemySprite from "../../renderables/golem-enemy";

import HUDContainer from "../hud/hud-container.js";
import VirtualJoypad from "../hud/virtual-joypad.js";

import { my_state, PLAYER_COLORS, BONUS_TILE } from "../../util/constants";
import { MPRemotePlayerSprite } from "../../renderables/multiplayer/mp-player";
import { MPLocalPlayerSprite } from "../../renderables/multiplayer/mp-local-player";
import GlobalGameState from "../../util/global-game-state";
import { BasePlayScreen } from "../base-play-screen";
import ChestBonusSprite from "../../renderables/terrain/chest-sprite.js";


export default class MultiplayerPlayScreen extends BasePlayScreen {
	players = [];  // list of MultiplayerPlayer entries, who is part of this game
    remotePlayers = []; // remove player sprites 
    chests = [];

	onResetEvent() {
        console.log("mp-play.OnEnter()");
        this.isExiting = false;
		this.isActive = false;
		this.players = [];
        this.player = null;
		this.enemies = [];
		this.enemyEmitter.isActive = false;
        this.remotePlayers = [];
        this.chests = [];

        this.players = this.playersFromGame(MultiplayerManager.get().multiplayerGame);        
		for( let x = 0; x < this.players.length; x++) {
			let p = this.players[x];
			if( p !== null ) {
            	console.log("  Player " + x + ": " + p.name);
			}
		}
		this.setupLevel();

        GlobalGameState.isMultiplayerMatch = true;
		this.hudContainer = new HUDContainer(0, 0);
		this.virtualJoypad = new VirtualJoypad();
		game.world.addChild(this.hudContainer);
		game.world.addChild(this.virtualJoypad, Infinity);


		this.handler = event.on(event.KEYUP, this.actionHandler, this);

        // Add a game paused event listener
        MultiplayerManager.get().addEventListener(MultiplayerMessageType.GAME_PAUSED, (evt) => {
            let message = evt.message;
            if( message.playerId !== MultiplayerManager.get().multiplayerPlayer.id ) {                
                if(message.isPaused ) {
                    this.hudContainer.setPaused(true, "*** " + message.message + " *** ");
                    state.pause();                
                }
                else {
                    state.resume();
                    this.hudContainer.setPaused(false);
                }
            }
        }, this);

        // Add a game over event listener
		MultiplayerManager.get().addEventListener(MultiplayerMessageType.GAME_OVER, (evt) => {	
            state.pause();		
            this.cleanupWorld();
            state.resume();
            this.updatePlayerData();
            MultiplayerManager.get().updatePlayerData().then( () => {
                state.change(my_state.MULTIPLAYER_GAME_OVER);            
            });
			
		}, this);

        // add a player removed event listener
        MultiplayerManager.get().addEventListener([MultiplayerMessageType.PLAYER_REMOVED, MultiplayerMessageType.PLAYER_GAVE_UP], (event) => {
            // check to see which player we have to remove now            
            let message = event.message;
            let theGame = event.game;
            for( let i = 0; i < this.remotePlayers.length; i++ ) {
                let rp = this.remotePlayers[i];
                if( rp !== null && rp.player.id === message.playerId) {                    
                    game.world.removeChild(rp);
                    console.log(message.type + ": Player " + (i + 1) + " (" + rp.player.name + ") was successfully removed");
                    this.remotePlayers[i] = null;                    
                    break;
                }
            }

        }, this);

		this.isActive = true;
	}

    /**
     * Updates the player data of the current active player and stores it back to the server
     */
    updatePlayerData() {
        let player = MultiplayerManager.get().multiplayerPlayer;
        player.energyLeft = GlobalGameState.energy;
        player.score = GlobalGameState.score;
        player.potionsLeft = GlobalGameState.magicBolts + GlobalGameState.magicFirespins + GlobalGameState.magicNebulas + GlobalGameState.magicProtections;
        player.chestsOpened = GlobalGameState.chestsOpened;
        player.placedBarriers = GlobalGameState.placedBarriers;
        player.usedBombs = GlobalGameState.usedBombs;
        player.bombsLeft = GlobalGameState.bombs;
        player.bittenBySpiders = GlobalGameState.bittenBySpiders;
        player.catchedByGolems = GlobalGameState.catchedByGolems;
        player.catchedByCats = GlobalGameState.catchedByCats;
        player.killedSpiders = GlobalGameState.killedSpiders;
        player.stunnedCats = GlobalGameState.stunnedCats;
        player.stunnedGolems = GlobalGameState.stunnedGolems;
        player.bonusCollected = GlobalGameState.bonusCollected;
        player.catchedByRemotePlayers = 0;
        player.otherPlayersHurt = 0;        
    }

    /**
     * Global keyup action handler for the MP game
     * @param {*} action 
     * @param {*} keyCode 
     * @param {*} edge 
     */
    actionHandler(action, keyCode, edge) {
        if (!state.isCurrent(my_state.MULTIPLAYER_PLAY)) return;
        if (action === "exit") {
            if (!this.isExiting && !state.isPaused()) {
                this.isExiting = true;
                this.cleanupWorld();

                // send player left message to others
                MultiplayerManager.get()
                    .sendPlayerGiveUp()
                    .then(() => {
                        MultiplayerManager.get().closeActiveGame();
                    })
                    .then(() => {
                        state.change(my_state.MULTIPLAYER_GAME_OVER);
                    });
            }
        } 
        else if (action === "pause") {            
            if (!state.isPaused()) {
                console.log("switching to pause");
                this.hudContainer.setPaused(true, "*** PAUSE ***");
                state.pause();
            } 
            else {
                console.log("switching to resume");
                state.resume();
                this.hudContainer.setPaused(false);
            }
            MultiplayerManager.get().sendPlayerPaused(state.isPaused());
        }
    }


    /**
     * cleans up the game world
     */
    cleanupWorld() {
        this.isActive = false;
        if (this.player !== null) {
            game.world.removeChild(this.player);
        }
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
        this.chests = [];
    }

    /**
     * Returns an array of players for this game
     * @param {*} theGame 
     * @returns 
     */
	playersFromGame(theGame) {
        return MultiplayerManager.get().getPlayersFromGame();
	}

	update(dt) {
        let isDirty = false;
        if( !GlobalGameState.isGameOver ) {
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
                isDirty = true;                
            }
            this.enemyEmitter.emitEvery -= dt;
        }
        else {
            this.isActive = false;
            if( !this.isExiting ) {
                this.isExiting = true;
                this.cleanupWorld();
                this.updatePlayerData();
                MultiplayerManager.get()
                    .updatePlayerData()
                    .then(() => {
                        state.change(my_state.MULTIPLAYER_GAME_OVER);
                    });
    }
        }
		return super.update(dt) || isDirty;		
	}

	setupLevel() {
		this.multiplayerGame = MultiplayerManager.get().multiplayerGame;
		this.currentLevel = MultiplayerManager.get().allLevels()[this.multiplayerGame.level];
		this.currentLevel.loadIntoMelon();
		level.load(this.currentLevel.id);


		let layers = level.getCurrentLevel().getLayers();
		let layerNum = 0;
        let playerNum = 0;
		layers.forEach((l) => {
			console.log(l.name);

			if (l.name === "Bonus") {
				// convert some bonus tiles to sprites
				for (let y = 0; y < l.height; y++) {
					for (let x = 0; x < l.width; x++) {
						let tile = l.cellAt(x, y);
						if (tile !== null && tile !== undefined) {
							if (tile.tileId === BONUS_TILE.closedChest) {
								console.log("  Chest at (" + x + "/" + y + ")");
								l.clearTile(x, y);
                                let chest = new ChestBonusSprite(x, y);
                                this.chests.push(chest);
								game.world.addChild(chest, layerNum);
							} 
                            else if (tile.tileId === BONUS_TILE.meat) {
							}
						}
					}
				}
			} 
			else if (l.name === "Persons") {
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

                                        if( playerObject.id === MultiplayerManager.get().multiplayerPlayer.id ) {
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
								// y seconds
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

        this.parseLevelObjects();
        
		// make sure, all enemies know the player
		this.enemies.forEach((e) => e.setPlayer(this.player));
	}

	onDestroyEvent() {
		console.log("MP-Play.OnExit()");
		this.isActive = false;
		game.world.removeChild(this.hudContainer);
		game.world.removeChild(this.virtualJoypad);
		let paul = event.off(event.KEYUP, this.actionHandler);
		//console.log("PAUL: " +paul);
        // make sure everything is removed!
        this.cleanupWorld();
        game.world.reset();

		// make sure dead components won't get notified on changes
		MultiplayerManager.get().clearAllEventListeners();
	}
}
