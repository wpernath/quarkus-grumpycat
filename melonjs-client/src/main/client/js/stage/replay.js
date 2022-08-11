import { Stage, state, game, event, level, Light2d, Vector2d, ColorLayer } from "melonjs"
import GlobalGameState from "../util/global-game-state";
import { LevelManager } from "../util/level";
import HUDContainer from "./hud/hud-container.js";
import VirtualJoypad from "./hud/virtual-joypad.js";

import { RemoteCatSprite } from "../renderables/replay/remote-cat";
import { SpiderEnemy } from "../renderables/spider-enemy.js";

import GolemEnemySprite from "../renderables/golem-enemy.js";
import { PlayerRemoteSprite } from "../renderables/replay/player-remote-sprite";
import { RemoteSpiderSprite } from "../renderables/replay/remote-spider";
import { my_state } from "../util/constants";


export default class ReplayGameScreen extends Stage {
	player;
	enemies = [];
	hudContainer = null;
	virtualJoypad = null;
	enemyActions = [];

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
	spotLight = null;

	onResetEvent() {
		this.player = null;
		this.spotLight = null;
		this.enemies = [];
		this.enemyEmitter.isActive = false;
        state.pause();
        LevelManager.getInstance().setCurrentLevel(GlobalGameState.gameToReplay.level-1);
        
		// Sort & split loaded enemy actions by enemy
		let currentEnemyName = "";
		let currentMovementArray = [];
		GlobalGameState.replayActions.enemies.forEach( (a, idx) => {
			if( a.name !== currentEnemyName ) {
				console.log("Loading & parsing actions for " + a.name);
				if( currentEnemyName !== "" ) {
					this.enemyActions[currentEnemyName] = currentMovementArray;
				}
				currentEnemyName = a.name;
				currentMovementArray = [];
			}
			currentMovementArray.push(a);
		});		
		this.enemyActions[currentEnemyName] = currentMovementArray;

		this.setupLevel();

		this.hudContainer = new HUDContainer(0, 0);
		this.virtualJoypad = new VirtualJoypad();
		game.world.addChild(this.hudContainer);
		game.world.addChild(this.virtualJoypad, Infinity);

		this.handler = event.on(event.KEYDOWN, function (action, keyCode, edge) {
			if (!state.isCurrent(my_state.REPLAY_GAME)) return;
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
			let name = "SpiderEnemy." + (this.enemyEmitter.emitCount + 1);
			let spider = new RemoteSpiderSprite(this.enemyEmitter.emitAt.x, this.enemyEmitter.emitAt.y, this.enemyActions[name]);
			spider.setEnemyName(name);
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
								let name = "CatEnemy." + enemynum++;
								let enemy = new RemoteCatSprite(x,y, this.enemyActions[name]);
								enemy.name = name;
								game.world.addChild(enemy);
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
                            else if( tile.tileId === 996) {
								let enemy = new GolemEnemySprite(x, y);
								let name = "Golem." + (enemynum + 1);
								enemynum++;
								enemy.setEnemyName(name);
								enemy.setWayPath(LevelManager.getInstance().getCurrentLevel().getPathForEnemy(name));

								game.world.addChild(enemy, this.spriteLayer);
								this.enemies.push(enemy);
								console.log("  enemy at (" + x + "/" + y + "): " + enemy);
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