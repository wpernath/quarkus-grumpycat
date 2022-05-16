# quarkus-grumpycat game

This Game uses Quarkus, the Supersonic Subatomic Java Framework and HTML 5 / JavaScript.

If you want to learn more about Quarkus, please visit its website: https://quarkus.io/ .

## The Game

This game was inspired by the old Fat-Cat game and by PacMan. You're controlling a dog in a maze which needs to eat all food without being caught by a grumpy cat. 

Right now you can control the dog with arrow keys UP, DOWN, LEFT & RIGHT and with W, A, S, D. Game logic is currently coded with JavaScript. 

![the game](docs/the-game.png)

## Running the application in dev mode

You can run your application in dev mode that enables live coding using:
```shell script
./mvnw compile quarkus:dev
```

## Game Server
The server part currently only consists of a HTML server serving index.html and the various scripts in JavaScript. It also contains `MazeResource.java` which will be called to download a level. 

Future of this project is to let the enemy's new positions be calculated by the server as well (`EnemyResource.java`).

## Game Logic
Currently, the complete game logic (including drawing the silly graphics) is being done in JavaScript. 

- `game-structs.js` contains some helper classes and global constants for the game like the size of the maze canvas and the size of the tiles. 

- `game-logic.js` contains the full game logic

### initLevel()
This function will be called whenever the level needs to be initialized (upon game start, after gameover or gamewon). It calls the `MazeResource.java` to download the level and prepares the local game logic. 

### gameLoop()
This function will be called by `window.requestAnimationFrame()` whenever the browser has time to play the game. It acts as the main game method and makes sure, the player moves, the cat tries to catch the dog, etc.

### drawMaze() 
This function draws the currently visible part of the maze based on level data read from server. After drawing the maze, it places the enemies in the maze (if visible) and draws the dog (the player).


### updatePlayer()
This function makes sure, the dog moves according to the keys pressed. It also makes sure, the dog doesn't move on tiles which should act as walls etc. 

### updateEnemy() 
This function calculates the shortest path between each enemy and the dog. It just calculates the next possible move for each cat based on a simple Lee Algorythm. 

