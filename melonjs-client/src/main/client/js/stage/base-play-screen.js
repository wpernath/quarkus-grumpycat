import { Stage, game, level, event, state, device, Light2d } from "melonjs/dist/melonjs.module.js";
import CatEnemy from "../renderables/cat-enemy.js";
import { SpiderEnemy } from "../renderables/spider-enemy.js";
import GolemEnemySprite from "../renderables/golem-enemy";

import PlayerEntity from "../renderables/player.js";
import HUDContainer from "./hud/hud-container.js";
import VirtualJoypad from "./hud/virtual-joypad.js";
import { LevelManager } from "../util/level.js";

import NetworkManager from "../util/network";
import { BONUS_TILE } from "../util/constants.js";
import ChestBonusSprite from "../renderables/terrain/chest-sprite.js";


export class BasePlayScreen extends Stage {
	player;
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

	updateasdfadf(dt) {
		if (!this.isActive) return super.update(dt);
		if (this.enemyEmitter.isActive && this.enemyEmitter.emitEvery <= 0 && this.enemyEmitter.emitCount > 0) {
			// emit a new spider
			this.enemyEmitter.emitCount--;
			this.enemyEmitter.emitEvery = this.enemyEmitter.emitTime;
			let spider = new SpiderEnemy(this.enemyEmitter.emitAt.x, this.enemyEmitter.emitAt.y);
			spider.setEnemyName("SpiderEnemy." + (this.enemyEmitter.emitCount + 1));
			this.enemies.push(spider);
			game.world.addChild(spider, this.spriteLayer);
			spider.setPlayer(this.player);
		}

		this.enemyEmitter.emitEvery -= dt;
		//this.whiteLight.centerOn(this.player.pos.x, this.player.pos.y);

		let dirty = super.update(dt);
		return dirty;
	}

	/**
	 * Sets up the level based on the tiled map etc. Parses enemies, players and
	 * instanciates all sprites.
	 */
	setupLevel() {
		LevelManager.getInstance().prepareCurrentLevel();
		this.currentLevel = LevelManager.getInstance().getCurrentLevel();

		let layers = level.getCurrentLevel().getLayers();
		let layerNum = 0;
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
								game.world.addChild(new ChestBonusSprite(x, y), layerNum);
							} else if (tile.tileId === BONUS_TILE.meat) {
							}
						}
					}
				}
			} else if (l.name === "Persons") {
				let enemynum = 0;
				this.spriteLayer = layerNum;
				for (let y = 0; y < l.height; y++) {
					for (let x = 0; x < l.width; x++) {
						let tile = l.cellAt(x, y);
						if (tile !== null && tile !== undefined) {
							if (tile.tileId === 993) {
								// player
								this.player = new PlayerEntity(x, y);
								this.player.name = "Player";
								console.log("  player at (" + x + "/" + y + "): " + this.player);
								game.world.addChild(this.player, this.spriteLayer);
							} else if (tile.tileId === 994) {
								let enemy = new CatEnemy(x, y);
								let name = "CatEnemy." + enemynum++;
								enemy.setEnemyName(name);
								game.world.addChild(enemy, this.spriteLayer);
								this.enemies.push(enemy);
								console.log("  enemy at (" + x + "/" + y + "): " + enemy);
							} else if (tile.tileId === 995) {
								// create a spider emitter, which emits up to X spiders every
								// 10 seconds
								this.enemyEmitter.isActive = true;
								this.enemyEmitter.emitAt.x = x;
								this.enemyEmitter.emitAt.y = y;
								this.enemyEmitter.emitCount = l.enemyNumEmitting;
								this.enemyEmitter.emitEvery = l.enemyTimeEmitting;
								console.log("  enemyEmitter at (" + x + "/" + y + "): ");
							} else if (tile.tileId === 996) {
								let enemy = new GolemEnemySprite(x, y);
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

	parseLevelObjects() {
		// now go through the list of objects in the currentLevel structure and create them
		if (this.currentLevel.objects !== null && this.currentLevel.objects !== undefined) {
			this.currentLevel.objects.forEach((obj) => {
				//console.log("  Level Object: " + obj.name);
				if (obj.type == LevelObject.types.ENEMY) {
					if (obj.clazz === "GolemEnemy") {
						let enemy = new GolemEnemySprite(obj.mapX, obj.mapY, false);
						enemy.setEnemyName(obj.name);
						let path = this.currentLevel.getPathForEnemy("Path." + obj.pathId);
						console.log("    Golem requires path " + obj.pathId + ": " + path);
						if (path !== null) {
							enemy.setWayPath(path);
							game.world.addChild(enemy, this.spriteLayer);
							this.enemies.push(enemy);
							console.log("  enemy at (" + obj.mapX + "/" + obj.mapY + "): " + enemy.name);
						}
					}
				} else if (obj.type === LevelObject.types.ENEMY_EMITTER) {
					console.log("  Placing an enemy emitter at " + obj.mapX + ", " + obj.mapY);
					let emitter = new EnemyEmitter(obj.mapX, obj.mapY, obj, this.player);
					game.world.addChild(emitter, this.spriteLayer);
				} else if (obj.type === LevelObject.types.CHEST) {
					let chest = new ChestBonusSprite(obj.mapX, obj.mapY);
					chest.score = obj.score;
					chest.numBombs = obj.numBombs;
					chest.numMagicBolts = obj.numMagicBolts;
					chest.numMagicFirespins = obj.numMagicFirespins;
					chest.numMagicNebulas = obj.numMagicNebulas;
					chest.numMagicProtectionCircles = obj.numMagicProtectionCircles;

					game.world.addChild(chest, this.spriteLayer - 1);
				}
			});
		}
	}
}
