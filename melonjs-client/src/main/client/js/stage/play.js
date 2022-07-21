import { Stage, game, level, event, state,device } from 'melonjs/dist/melonjs.module.js';
import CatEnemy from '../renderables/cat-enemy.js';
import { SpiderEnemy } from '../renderables/spider-enemy.js';
import GolemEnemySprite from '../renderables/golem-enemy.js';
import PlayerEntity from "../renderables/player.js";
import GlobalGameState from '../util/global-game-state';
import HUDContainer from './hud/hud-container.js';
import VirtualJoypad from './hud/virtual-joypad.js';
import { LevelManager } from '../util/level.js';



class PlayScreen extends Stage {
    player;
    enemies= [];
    hudContainer = null;
    virtualJoypad = null;

    enemyEmitter = {
        isActive: false,
        emitAt: {
            x:0,
            y:0,
        },
        emitEvery: 5000, // ms
        emitTime: 5000,
        emitCount: 10
    };
    /**
     *  action to perform on state change
     */
    onResetEvent() {
        console.log("Play.OnEnter()");
        this.player = null;
        this.enemies = [];
        this.enemyEmitter.isActive = false;

        this.setupLevel();

        this.hudContainer = new HUDContainer(0,0);
        this.virtualJoypad = new VirtualJoypad();
        game.world.addChild(this.hudContainer);
        game.world.addChild(this.virtualJoypad);

        this.handler = event.on(event.KEYDOWN, function (action, keyCode, edge) {
            if (!state.isCurrent(state.PLAY)) return;            
            if (action === "pause") {
                if( !state.isPaused() ) {
                    state.pause();
                }
                else {
                    state.resume();
                }                        
            }
            if( action === "exit") {
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

    }

    onDestroyEvent() {
      console.log("Play.OnExit()");  
      game.world.removeChild(this.hudContainer);
      game.world.removeChild(this.virtualJoypad);
      event.off(event.KEYDOWN, this.handler);
    }

    update(dt) {
        
        if( this.enemyEmitter.isActive && this.enemyEmitter.emitEvery <=0 && this.enemyEmitter.emitCount >0) {
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
        //level.load(GlobalGameState.levels[GlobalGameState.currentLevel]);
        LevelManager.getInstance().prepareCurrentLevel();
        
        console.log("PLAYING: " + level.getCurrentLevelId());

        let layers = level.getCurrentLevel().getLayers();
        layers.forEach((l) => {
            console.log(l.name);
            if (l.name === "Persons") {
                console.log("  should be not visible");
                let enemynum = 0;
                for (let y = 0; y < l.height; y++) {
                    for (let x = 0; x < l.width; x++) {
                        let tile = l.cellAt(x, y);
                        if (tile !== null && tile !== undefined) {
                            if (tile.tileId === 993) {
                                // player
                                this.player = new PlayerEntity(x, y);
                                this.player.name = "Player";
                                console.log("  player at (" + x + "/" + y + "): " + this.player);
                                game.world.addChild(this.player);
                            } else if (tile.tileId === 994) {
                                let enemy = new CatEnemy(x, y);
                                enemy.name = "CatEnemy" + enemynum++;
                                game.world.addChild(enemy);
                                this.enemies.push(enemy);
                                console.log("  enemy at (" + x + "/" + y + "): " + enemy);
                            } else if (tile.tileId === 995) {
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

};

export default PlayScreen;
