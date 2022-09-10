import { collision, level, game, Sprite, Body, Rect } from "melonjs/dist/melonjs.module.js";
import { BaseWeapon } from "./base-weapon";

class BombEntity extends BaseWeapon {

	/**
	 * constructor
	 */
	constructor(x, y) {
		// call the parent constructor
		super(x, y, {
			width: 32,
			height: 64,
			image: "BombExploding",
			framewidth: 32,
			frameheight: 64,
		});

		this.addAnimation("bzzz", [0, 1, 2, 3, 4, 5, 6]);
		this.addAnimation("boom", [7, 8, 9, 10, 11, 12, 13]);
		this.setCurrentAnimation("bzzz", () => {
			game.viewport.shake(50, 400);
			this.isExploding = true;
			this.setCurrentAnimation("boom", () => {
				this.isExploding = false;
				game.world.removeChild(this);
				// remove all border tiles in a 3/3 radius
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
					this.borderLayer.clearTile(x, y);
				});
				return false;
			});
		});
	}

}

export default BombEntity;
