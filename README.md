# quarkus-grumpycat game

This Game uses Quarkus, the Supersonic Subatomic Java Framework and HTML 5 / JavaScript.

If you want to learn more about Quarkus, please visit its website: https://quarkus.io/ .

## The Game

This game was inspired by the old Fat-Cat game and by PacMan. You're controlling a dog in a maze which needs to eat all food without being caught by a grumpy cat. 

Right now you can control the dog with arrow keys UP, DOWN, LEFT & RIGHT and with W, A, S, D. More keys are:

- *P* PAUSE
- *SPACE* place bomb
- *Shift* + UP/DOWN/LEFT/RIGHT: place barrier in the direction

If the cat gets into an exploding bomb, it stops for 3sec. A bomb can destroy barriers. The game ends if you got all food.
  

Game logic is currently coded with JavaScript. 

![the game](docs/the-game.png)

## Running the application in dev mode

You can run your application in dev mode that enables live coding using:
```shell script
./mvnw compile quarkus:dev
```

## Game Server
The server part consists of a HTML server serving index.html and the various scripts in JavaScript. It also contains `MapResource.java` which will be called to download a level in the format of [Tiled MapEditor](https://mapeditor.org). All levels are stored in JSON format in `java/resources/map`. The all sources for the levels in the original XML based format of the MapEditor are stored in `/tiled`. 

The Game Server needs a PostgreSQL database server to store new games (`GameResource.java`) and to store the player's actions in (`PlayerMovementResource.java`). 



## Game Logic
The complete game logic (including drawing the graphics) is being done in JavaScript. 

- `game-logic.js` contains the full game logic. `setupGame()` will be called by the `onLoad` event of the `index.html` file.

- `game-structs.js` contains some helper classes and global constants for the game like the Player class, the Camera, the Enemy class etc. 

- `game-tiled-renderer.js` contains the logic to load and parse a map in the format of [Tiled MapEditor](https://mapeditor.org) and to draw the map with all its layers and player / enemies.

### `game-logic.js`: initLevel()
This function will be called whenever the level needs to be initialized (upon game start, after gameover or gamewon). It calls the `MapResource.java` to download the level and prepares the local game logic. 

### `game-logic.js`: gameLoop()
This function will be called by `window.requestAnimationFrame()` whenever the browser has time to play the game. It acts as the main game method and makes sure, the player moves, the cat tries to catch the dog, etc.

### `game-logic.js`: drawMaze() 
This function draws the currently visible part of the maze based on level data read from server. After drawing the maze, it places the enemies in the maze (if visible) and draws the dog (the player).


### `game-logic.js`: updatePlayer()
This function makes sure, the dog moves according to the keys pressed. It also makes sure, the dog doesn't move on tiles which should act as walls etc. 

### `game-logic.js`: updateEnemy() 
This function calculates the shortest path between each enemy and the dog. It just calculates the next possible move for each cat based on a simple Lee Algorythm. If there is no direct path between the cat and the player, it follows the logic: walk in a random walkable direction until you hit a border, then choose another random walkable direction. 


## Creating new Levels
To create a new level, download the [Tiled MapEditor](https://mapeditor.org). A `Level-Template.tmx` can be found in `/tiled` folder. The only supported tileset currently is `/tiled/Terrain.tsx`. Please make sure to save the new Level with embedded tileset. If you're done creating the level and would like to use it in the game, export it in JSON format and store it in `/java/resources/maps`. Then you need to update `MapResource.java` to include this new level. 

If you directly want to play your new level, you could open `game-logic.js` and go to the function `initGame()` where you can change the global variable `currentLevel` to point to the index of the array in `MapResource.java`. 

Maps can be of any size. The only important thing you need to keep in mind are the names and function of the layers of a map:

- **Ground:** This is the base ground of the level. You can put any tile here.  
- **Frame:** This layer is the border of the map. Anything placed here will be used as barrier for player and enemies. Anything placed here can be destroyed with a bomb. 
- **Dekor:** Use this layer to place decorative tiles on. For example flowers on water or stones on sand. 
- **Bonus:** Use this layer to place your bonus items on. Any tile placed here can be a bonus which adds a score of 10 points. Once the player walks over it, the bonus items gets removed. Special bonus tile is the bomb, which provides 5 more bombs to the player to be used to destroy frames.
- **Persons:** This layer will be used to place the player and enemies on. Use the two sign tiles as player and enemies. Note, you MUST not place more than one player, but you CAN place more than one enemy.

You might add more layers to your map. Any layer placed on top of **Persons** will be drawn last, which means it might draw over enemies and player sprites.

## Running on Docker / Podman
There are container images ready to be used on [Quay.io](https://quay.io/wpernath/quarkus-grumpycat). Use this command to pull the image to your local repository:

```shell
docker pull quay.io/wpernath/quarkus-grumpycat
```

Note, to run the server part, you need to have a PostgreSQL database running. You can use the `docker-compose.yaml` file in `src/main/docker/` to setup a local docker / podman compose environment.

```shell
docker-compose -f src/main/docker/docker-compose.yaml [--detach|-d] up
```

The app is then available under `http://localhost:8081` in your browser.


## Running on Kubernetes / OpenShift
### OpenShift S2I
Installing database

```shell
oc new-app postgresql-persistent \
	-p POSTGRESQL_USER=cat \
	-p POSTGRESQL_PASSWORD=grumpy \
	-p POSTGRESQL_DATABASE=catdb \
	-p DATABASE_SERVICE_NAME=catserver
```

Start building the app
```shell
oc new-app java:openjdk-17-ubi8~https://github.com/wpernath/quarkus-grumpycat.git  --name=grumpy-cat --build-env MAVEN_MIRROR_URL=http://nexus.ci:8081/repository/maven-public/
```

Expose the service
```shell
oc expose svc/grumpy-cat
```


## About the graphics
The map graphics are coming from [LPC Terrain](https://opengameart.org/content/tiled-terrains) and all its authors. Special thanks to all of them!
                    