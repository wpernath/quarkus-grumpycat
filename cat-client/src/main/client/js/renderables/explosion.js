import { collision, level, game, Sprite, Body, Rect } from "melonjs/dist/melonjs.module.js";
import { BARRIER_TILE } from "../util/constants";
import { BaseWeapon } from "./base-weapon";

class ExplosionEntity extends BaseWeapon {

	/**
	 * constructor
	 */
	constructor(x, y) {
		// call the parent constructor
		super(x, y, {
			width: 96,
			height: 96,
			image: "explosion",
			framewidth: 256,
			frameheight: 256,
		});

		this.addAnimation("boom", [
            0,  1,  2 , 3 , 4 , 5 , 6 , 7 ,
            8,  9,  10, 11, 12, 13, 14, 15,
            16, 17, 18, 19, 20, 21, 22, 23, 
            24, 25, 26, 27, 28, 29, 30, 31,
            32, 33, 34, 35, 36, 37, 38, 39,  
            40, 41, 42, 43, 44, 45, 45, 46,
            47, 48, 49, 50, 51, 52, 53, 54, 
            55, 56, 57, 58, 59, 60, 61, 62,  
        ], 16);
        this.isExploding = true;
		        
		this.setCurrentAnimation("boom", () => {
			
            game.world.removeChild(this);
            // remove all frames in a 3/3 radius
            let rad = [
                { x: -1, y: -1 },
                { x: 0, y: -1 },
                { x: +1, y: -1 },
                { x: -1, y: 0 },
                { x: +1, y: 0 },
                { x: -1, y: +1 },
                { x: 0, y: +1 },
                { x: +1, y: +1 },
            ];
            rad.forEach((pos) => {
                let x = Math.floor((this.pos.x + pos.x * 32) / 32);
                let y = Math.floor((this.pos.y + pos.y * 32) / 32);
				if( x >-1 && x < this.borderLayer.width && y > -1 && y < this.borderLayer.height ) {
					let tile = this.borderLayer.cellAt(x,y);
					if( tile !== null && tile !== undefined && tile.tileId === BARRIER_TILE.dark) {
                		this.borderLayer.clearTile(x, y);
					}
				}
            });			
		});

        game.viewport.shake(50, 62*16);
	}
}

export default ExplosionEntity;
