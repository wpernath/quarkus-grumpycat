import { level, loader } from "melonjs/dist/melonjs.module.js";
import CONFIG from "../../config";
import { WayPath, WayPoint } from "./walk-path";

export class Level {
	constructor(info, name, longName, data) {
		this.info = info;
		this.id = info.id;
        this.previewImage = info.preview;
		this.name = name;
		this.longName = longName;
		this.data = data;
		this.description = data.description;
		this.loadedIntoMelon = false;
        this.mapWidth = data.width;
        this.mapHeight = data.height;
		this.wayPoints = [];
		this.wayPaths = [];
		this.parseObjects();
	}

	loadIntoMelon() {
		if (!this.loadedIntoMelon) {
			loader.load({ name: this.id, src: this.info.path, type: "tmx", format: "json", data: this.data }, this.onLoaded);

			this.loadedIntoMelon = true;
		}
	}

	onLoaded() {}

	applyProperties(obj, point) {
        if( obj.properties !== null ) {
            obj.properties.forEach( (p) => {
                if( p.name === 'forEnemy' ) {
                    point.forEnemy = p.value;
                }
            });
        }
    }

	parseObjects() {
		this.data.layers.forEach((l) => {
			if (l.type === "objectgroup" && l.objects !== null) {
				l.objects.forEach((obj) => {
					if (obj.name === "WayPoint") {
						let point = new WayPoint(Math.floor(obj.x / 32), Math.floor(obj.y / 32));
						this.applyProperties(obj, point);
						this.wayPoints.push(point);

                        //console.log("  Read point: " + JSON.stringify(point));
					}
                    else if( obj.name === 'WayPath' && obj.polyline !== null ) {
                        let path = new WayPath(Math.floor(Math.round(obj.x) / 32), Math.floor(Math.round(obj.y) / 32));                        
                        let startX = Math.round(obj.x);
                        let startY = Math.round(obj.y);

                        this.applyProperties(obj, path);
                        this.wayPaths[path.forEnemy] = path;

                        obj.polyline.forEach( (point) => {                
                            let x = Math.round(startX + point.x);
                            let y = Math.round(startY + point.y);
                            let wayPoint = new WayPoint(Math.floor(x / 32), Math.floor(y / 32));
    						path.addWayPoint(wayPoint);
                        });
                    }

				});

                // we are deleting the objects from the source to be able load it into melonjs
                l.objects = null;
			}
		});

        // create wayPath objects for each group of waypoint
        if( this.wayPoints.length > 0 ) {
            this.wayPoints.forEach( (p) => {
                if( this.wayPaths[p.forEnemy] !== undefined ) {
                    console.log(this.wayPaths[p.forEnemy]);
                    this.wayPaths[p.forEnemy].addWayPoint(p);
                }
                else {
                    this.wayPaths[p.forEnemy] = new WayPath(p.x,p.y);
                    this.wayPaths[p.forEnemy].addWayPoint(p);
                }
            });
        }
	}

    getPathForEnemy(name) {
        if( this.wayPaths[name] !== undefined ) {
            return this.wayPaths[name];
        }
    }
}

var levelManager = null; 

const LEVEL_NAMES = [
	// GUIDs from manifest.js
	{ id: "level1", path: "maps/0.json", loaded: false, error: false, multiplayer: false, preview: "Level1" },
	{ id: "level2", path: "maps/1.json", loaded: false, error: false, multiplayer: false, preview: "Level2" },
	{ id: "level3", path: "maps/2.json", loaded: false, error: false, multiplayer: false, preview: "Level3" },
	{ id: "level4", path: "maps/3.json", loaded: false, error: false, multiplayer: false, preview: "Level4" },
	{ id: "level5", path: "maps/4.json", loaded: false, error: false, multiplayer: false, preview: "Level5" },
	{ id: "level6", path: "maps/5.json", loaded: false, error: false, multiplayer: false, preview: "Level6" },
];

const MULTIPLAYER_LEVELS = [
	// multiplayer levels
	{ id: "mp1", path: "maps/mp/0.json", loaded: false, error: false, multiplayer: true, preview: "mp1" },
	{ id: "mp2", path: "maps/mp/1.json", loaded: false, error: false, multiplayer: true, preview: "mp2" },
];

export class LevelManager {
    allLevels = [];
    mpLevels = [];
    currentLevel = 0;
    levelChangeListeners = [];

    constructor() {        
    }

    /**
     * 
     * @returns the main instance of LevelManager
     */
    static getInstance() {
        if( levelManager == null ) {
            console.log("Creating LevelManager instance");
            levelManager = new LevelManager();
        }
        return levelManager;
    }

    async _loadLevelData(info) {
        let url = CONFIG.baseURL + info.path;
        let myThis = this;
        console.log("  LevelManager: Loading level '" + info.id + "'");

        let res = await fetch(url);
        let data = await res.json();
        let level = new Level(info, data.name, data.longName, data);
        console.log("  Loaded: " + info.id + " = " + level.name);
        if( info.multiplayer ) {
            this.mpLevels[info.id] = level;
        }
        else {
            this.allLevels[info.id] = level;
        }        
        return level;
    }

    /**
     * Initialize the LevelManager and load all levels as JSON into memory. 
     * 
     * @param {*} callback, called when all levels are loaded asynchronously
     */
    initialize(callback) {
        const promises = [];
        for (let i = 0; i < LEVEL_NAMES.length; i++) {
            let info = LEVEL_NAMES[i];
            promises.push(this._loadLevelData(info));
        }

        for( let i = 0; i < MULTIPLAYER_LEVELS.length; i++ ) {
            let info = MULTIPLAYER_LEVELS[i];
			promises.push(this._loadLevelData(info));
        }

        Promise.all(promises).then((res) => {
            console.log("  All Levels loaded: " + res);
            callback();
        })
        .catch(function(err) {
            console.log("  LevelManager: Failed loading level " + err);
        });
    }

    addLevelChangeListener(callback) {
        this.levelChangeListeners.push(callback);
    }

    async _fireLevelChanged(oldLevel, newLevel) {
        this.levelChangeListeners.forEach((l) => {
            l(oldLevel, newLevel);
        });
    }

    /**
     * 
     * @returns the current level information
     */
    getCurrentLevel() {
        let levelId = LEVEL_NAMES[this.currentLevel].id;
        return this.allLevels[levelId];
    }

    getCurrentLevelId() {
        let levelId = LEVEL_NAMES[this.currentLevel].id;
        return levelId;
    }

    getCurrentLevelIndex() {
        return this.currentLevel;
    }

    /**
     * reset the current level info
     */
    reset() {
        console.log("  LevelManager.reset() ");
        this.currentLevel = 0;
    }

    /**
     * Set the current level index. This is mainly being used
     * by the replay feature.
     * 
     * @param {int} lvl current level index
     */
    setCurrentLevel(lvl) {
        this.currentLevel = lvl;
        return this.getCurrentLevel();
    }

    /**
     * 
     * @returns the next level or the 0th one.
     */
    next() {
        console.log("  LevelManager.next() ");        
        let oldLevel = this.currentLevel;
        this.currentLevel++;
        if( this.currentLevel >= LEVEL_NAMES.length) {
            this.reset();
        }
        this._fireLevelChanged(oldLevel, this.currentLevel);        
    }

    /**
     * 
     * @returns the previous level or the 0th one.
     */
    prev() {
        console.log("  LevelManager.prev() ");
        let oldLevel = this.currentLevel;
        this.currentLevel--;
        if( this.currentLevel < 0 ) {
            this.reset();
        }
        this._fireLevelChanged(oldLevel, this.currentLevel);        
    }

    hasNext() {        
        if (this.currentLevel < LEVEL_NAMES.length - 1) return true;
        return false;
    }

    hasPrev() {
        if( this.currentLevel > 0 ) return true;
        return false;
    }

    levelCount() {
        return LEVEL_NAMES.length;
    }

    prepareCurrentLevel() {
        let l = this.getCurrentLevel();
        console.log("  LevelManager.prepareCurrentLevel('" + this.getCurrentLevelId() + "')");        
        l.loadIntoMelon();
        level.load(l.id);
    }


    allMultiplayerLevels() {
        let levels = [];
        MULTIPLAYER_LEVELS.forEach( (l) => {
            levels.push(this.mpLevels[l.id]);
        });
        return levels;
    }
}