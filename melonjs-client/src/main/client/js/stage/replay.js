import { Stage, state, game, event, level } from "melonjs"
import GlobalGameState from "../util/global-game-state";
import { LevelManager } from "../util/level";
import HUDContainer from "./hud/hud-container.js";
import VirtualJoypad from "./hud/virtual-joypad.js";

import {BasePlayerSprite, BONUS_TILE, BARRIER_TILE} from "../renderables/base-player";
import CatEnemy from "../renderables/cat-enemy.js";
import { SpiderEnemy } from "../renderables/spider-enemy.js";
import BombEntity from "../renderables/bomb";
import GolemEnemySprite from "../renderables/golem-enemy.js";


class PlayerRemoteSprite extends BasePlayerSprite {
    lastPlayerAction = null;
    lastReplay = 0;

    constructor(x,y) {
        super(x,y);
        this.playerActions = GlobalGameState.replayActions;
        this.replayActionIndex = 0;
        this.replayDone = false;
    }

    update(dt) {   
        if (this.replayActionIndex < this.playerActions.length) {
			let playerAction = this.playerActions[this.replayActionIndex];
            let hasElapsed   = 0;
            let mustElapsed  = 0;

            if( this.lastPlayerAction != null ) {
                // check for time
                mustElapsed = new Date(playerAction.time).getMilliseconds() - new Date(this.lastPlayerAction.time).getMilliseconds();
                hasElapsed  = performance.now() - this.lastReplay;
                if( hasElapsed < mustElapsed ) {
                    // skip this frame
                    return super.update(dt);
                }
            }
            this.lastReplay = performance.now();
            this.lastPlayerAction = playerAction;
            this.replayActionIndex++;

            if( playerAction.gutterThrown ) {
                this.placeBorderTile(playerAction.x + playerAction.dx, playerAction.y + playerAction.dy);
            }
            else if( playerAction.bombPlaced ) {
                this.pos.x = playerAction.x * 32 + 16;
                this.pos.y = playerAction.y * 32 + 16;

                game.world.addChild(new BombEntity(this.pos.x, this.pos.y));
                GlobalGameState.usedBombs++;
                GlobalGameState.bombs--;
            }
            else { // just movement                
                this.pos.x = playerAction.x * 32 + 16;
                this.pos.y = playerAction.y * 32 + 16;

                this.checkBonusTile(this.pos.x, this.pos.y);
			}            
		} 
        else {
            if( !this.replayDone ) {
			    state.change(state.MENU);
                this.replayDone = true;
            }
		}
        return super.update(dt);        
    }
}

export default class ReplayGameScreen extends Stage {
	player;
	enemies = [];
	hudContainer = null;
	virtualJoypad = null;

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
		this.player = null;
		this.enemies = [];
		this.enemyEmitter.isActive = false;
        state.pause();
        LevelManager.getInstance().setCurrentLevel(GlobalGameState.gameToReplay.level-1);
        
		this.setupLevel();

		this.hudContainer = new HUDContainer(0, 0);
		this.virtualJoypad = new VirtualJoypad();
		game.world.addChild(this.hudContainer);
		game.world.addChild(this.virtualJoypad, Infinity);

		this.handler = event.on(event.KEYDOWN, function (action, keyCode, edge) {
			if (action === "pause") {
				if (!state.isPaused()) {
					state.pause();
				} else {
					state.resume();
				}
			}
			if (action === "exit") {
				state.change(state.MENU);
			}
			if (action === "fullscreen") {
				console.log("requesting full screen");
				if (!device.isFullscreen) {
					device.requestFullscreen();
				} else {
					device.exitFullscreen();
				}
			}
		});

        state.resume();
	}

	onDestroyEvent() {
		console.log("RePlay.OnExit()");
		game.world.removeChild(this.hudContainer);
		game.world.removeChild(this.virtualJoypad);
		event.off(event.KEYDOWN, this.handler);
	}

	update(dt) {
		if (this.enemyEmitter.isActive && this.enemyEmitter.emitEvery <= 0 && this.enemyEmitter.emitCount > 0) {
			// emit a new spider
			this.enemyEmitter.emitCount--;
			this.enemyEmitter.emitEvery = this.enemyEmitter.emitTime;
			let spider = new SpiderEnemy(this.enemyEmitter.emitAt.x, this.enemyEmitter.emitAt.y);
			spider.name = "SpiderX";
			this.enemies.push(spider);
			game.world.addChild(spider);
			spider.setPlayer(this.player);
		}

		this.enemyEmitter.emitEvery -= dt;
		let dirty = super.update(dt);
		return dirty;
	}

	setupLevel() {
		LevelManager.getInstance().prepareCurrentLevel();
		let layers = level.getCurrentLevel().getLayers();
		layers.forEach((l) => {
			console.log(l.name);
			if (l.name === "Persons") {
				let enemynum = 0;
				for (let y = 0; y < l.height; y++) {
					for (let x = 0; x < l.width; x++) {
						let tile = l.cellAt(x, y);
						if (tile !== null && tile !== undefined) {
							if (tile.tileId === 993) {
								// player
								this.player = new PlayerRemoteSprite(x, y);
								this.player.name = "Player";
								console.log("  player at (" + x + "/" + y + "): " + this.player);
								game.world.addChild(this.player);
							} 
                            else if (tile.tileId === 994) {
								let enemy = new CatEnemy(x,y);
								enemy.name = "CatEnemy" + enemynum++;
								game.world.addChild(enemy);
								this.enemies.push(enemy);
								console.log("  enemy at (" + x + "/" + y + "): " + enemy);
							} 
                            else if (tile.tileId === 995) {
								// create a spider emitter, which emits up to X spiders every
								// 10 seconds
								this.enemyEmitter.isActive = true;
								this.enemyEmitter.emitAt.x = x + 1;
								this.enemyEmitter.emitAt.y = y + 1;
								this.enemyEmitter.emitCount = l.enemyNumEmitting;
								this.enemyEmitter.emitEvery = l.enemyTimeEmitting;
								console.log("  enemyEmitter at (" + x + "/" + y + "): ");
							}
						}
					}
				}
			}
		});
		// make sure, all enemies know the player
		this.enemies.forEach((e) => e.setPlayer(this.player));
	}
}