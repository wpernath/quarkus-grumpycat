import { game, input, Sprite, Body, collision, level, Tile, Rect, state } from 'melonjs/dist/melonjs.module.js';
import BombEntity from './bomb';
import ExplosionEntity from './explosion';
import GlobalGameState from '../util/global-game-state';
import { ENEMY_TYPES } from './base-enemy';
import CONFIG from '../../config';
import { LevelManager } from '../util/level';
import NetworkManager from '../util/network';

import { BONUS_TILE, BasePlayerSprite, BARRIER_TILE } from './base-player';

class PlayerEntity extends BasePlayerSprite {

    levelOver = false;

    /**
     * constructor
     */
    constructor(x, y) {
        // call the parent constructor
        super(x,y);
    }



    /**
     * update the entity
     */
    update(dt) {
        let mapX = Math.floor(this.pos.x / 32);
        let mapY = Math.floor(this.pos.y / 32);
        let dx = 0,
            dy = 0;

        // this is the data to be stored on the server
        const action = {
            playerId: GlobalGameState.globalServerGame.player.id,
            gameId: GlobalGameState.globalServerGame.id,
            dx: 0,
            dy: 0,
            x: mapX,
            y: mapY,
            bombPlaced: false,
            gutterThrown: false,
            gameOver: false,
            gameWon: false,
            score: GlobalGameState.score,
            time: new Date(performance.now()),
        };

        if( this.levelOver ) return super.update(dt);

        if( input.isKeyPressed("barrier")) {
            /*
            if (this.oldDx < 0) this.setCurrentAnimation("stand-left");
            else if (this.oldDx > 0) this.setCurrentAnimation("stand-right");
            else if (this.oldDy < 0) this.setCurrentAnimation("stand-up");
            else if (this.oldDy > 0) this.setCurrentAnimation("stand-down");
            */
            if( input.isKeyPressed("left")) {
                dx =-1;
            //    this.setCurrentAnimation("stand-left");
            }
            else if( input.isKeyPressed("right")) {
                dx =+1;
            //    this.setCurrentAnimation("stand-right");
            }
            if( input.isKeyPressed("up")) {
            //    this.setCurrentAnimation("stand-up");
                dy =-1;
            }
            else if( input.isKeyPressed("down")){
            //    this.setCurrentAnimation("stand-down");
                dy =+1;
            }

            this.oldDx = dx;
            this.oldDy = dy;
            if( dx != 0 || dy != 0) {
                // place a new barrier tile in borderLayer
                // only if there is no border tile at that pos
                let bX = mapX + dx;
                let bY = mapY + dy;
                if( this.placeBorderTile(bX, bY)) {

                    action.dx = dx;
                    action.dy = dy;
                    action.gutterThrown = true;

                    NetworkManager.getInstance().writePlayerAction(action)
                        .then(function (res) {
                            console.log("update send to server");
                        })
                        .catch(function (err) {
                            console.error(err);
                        });                    
                }
            }
        }
        else {
            if( input.isKeyPressed("bomb")) {
                if( GlobalGameState.bombs > 0 ) {
                    game.world.addChild(new BombEntity(this.pos.x, this.pos.y));   
                    GlobalGameState.usedBombs++;         
                    GlobalGameState.bombs--;
                    action.bombPlaced = true;
                    NetworkManager.getInstance()
                        .writePlayerAction(action)
                        .then(function (res) {
                            console.log("update send to server " );
                        })
                        .catch(function (err) {
                            //console.error(err);
                        });                    

                }
            }
            if( input.isKeyPressed("explode")) {
                game.world.addChild(new ExplosionEntity(this.pos.x, this.pos.y));            
            }

            if( input.isKeyPressed("accel")) {
                this.currentSpeed = this.SPEED / 2;
            }
            else {
                this.currentSpeed = this.SPEED;
            }

            if (input.isKeyPressed("left")) {            
                this.flipX(true);
                dx = -this.currentSpeed;
                if(this.oldDx >= 0) {
                    //this.setCurrentAnimation("walk-left");
                    this.oldDx = dx;
                }
            } 
            else if (input.isKeyPressed("right")) {
                this.flipX(false);
                dx = +this.currentSpeed;
                if(this.oldDx <=0 ) {
                    this.oldDx = dx;
                //    this.setCurrentAnimation("walk-right");
                }
            } 
            if (input.isKeyPressed("up")) {
                dy = -this.currentSpeed;
                if( this.oldDy >=0) {
                //    this.setCurrentAnimation("walk-up");
                    this.oldDy = dy;
                }
            } 
            else if (input.isKeyPressed("down")) {
                dy = +this.currentSpeed;
                if( this.oldDy <= 0 ) {
                //    this.setCurrentAnimation("walk-down");
                    this.oldDy = dy;
                }
            }


            if ((dx != 0 || dy != 0) && this.isWalkable(this.pos.x + dx, this.pos.y + dy)) {
                this.pos.x += dx;
                this.pos.y += dy;

                action.dx = dx;
                action.dy = dy;
                
                this.checkBonusTile(this.pos.x, this.pos.y);
                if( this.collectedBonusTiles >= this.numberOfBonusTiles ) {
                    // level done, check to see if there are more levels
                    action.gameWon = true;
                    this.levelOver = true;
                    if( LevelManager.getInstance().hasNext() ) {
                        LevelManager.getInstance().next();
                        state.change(state.READY);
                    }
                    else {                        
                        state.change(state.GAME_END);
                    }
                }

                if (this.pos.x < 0) this.pos.x = 0;
                if (this.pos.x > this.mapWidth * 32) this.pos.x = this.mapWidth * 32;
                if (this.pos.y < 0) this.pos.y = 0;
                if (this.pos.y > this.mapHeight * 32) this.pos.y = this.mapHeight * 32;

                mapX = Math.floor(this.pos.x / 32);
                mapY = Math.floor(this.pos.y / 32);

                if( mapX != this.lastMapX || mapY != this.lastMapY || action.gameWon || action.gameOver) {
                    action.x = mapX;
                    action.y = mapY;
                    this.lastMapX = mapX;
                    this.lastMapY = mapY;

                    NetworkManager.getInstance()
                        .writePlayerAction(action, action.gameWon)
                        .then(function (res) {
                            console.log("update send to server: " + action.gameWon);
                        })
                        .catch(function (err) {
                            //console.error(err);
                        });                    
                }
            }
        }

        if (GlobalGameState.energy <= 0) {
            console.log("GAME OVER!");
            GlobalGameState.isGameOver = true;
            this.levelOver = true;
            state.change(state.GAMEOVER);
            action.gameOver = true;
            NetworkManager.getInstance()
                .writePlayerAction(action, true)
                .then(function (res) {
                    console.log("update send to server, flushing!");
                })
                .catch(function (err) {
                    //console.error(err);
                });                    

        }

        // call the parent method
        return super.update(dt);
    }

};

export default PlayerEntity;
