import { game, Sprite, timer } from "melonjs";
import SpiderEnemy from "../spider-enemy";
import BaseTerrainSprite from "./terrain-sprite";

export class EnemyEmitter extends BaseTerrainSprite {
    constructor(x, y, data, localPlayer, remotePlayers = []) {
        super(x,y, [116-1]);

        this.data = data;
        this.localPlayer = localPlayer;
        this.remotePlayers = remotePlayers;
        this.enemyType = data.enemyType;
        this.numEnemies = data.numEnemies;
        this.emitEvery = data.emitEvery;
        this.mapX = data.mapX;
        this.mapY = data.mapY;
        this.enemyNum = 1;
        
        this.timerId = timer.setInterval( () => {
            console.log("  Emitting another " + this.enemyType);
			let spider = new SpiderEnemy(this.mapX, this.mapY);
			spider.setEnemyName("SpiderEnemy." + this.enemyNum);

			//this.enemies.push(spider);
			game.world.addChild(spider, 6);
			spider.setPlayer(this.localPlayer);
            this.enemyNum++;
            this.numEnemies--;
            if( this.numEnemies <= 0 ) {
                console.log("  EnemyEmitter is out of stock!");
                timer.clearInterval(this.timerId);
                this.timerId = null;
                game.world.removeChild(this);
            }

        }, this.emitEvery);
    }

    destroy() {
        if( this.timerId !== null ) {
            timer.clearInterval(this.timerId);
        }
        super.destroy();
    }

    onCollision(response, other) {return false;}
}