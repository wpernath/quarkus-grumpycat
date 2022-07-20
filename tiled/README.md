# Tiled MapEditor files

This folder contains all the files to create or change new / existing levels with [Tiled MapEditor](https://mapeditor.org).

## Creating new Levels
To create a new level, download the [Tiled MapEditor](https://mapeditor.org). A `Level-Template.tmx` can be found in this folder. The only supported tileset currently is `/tiled/Terrain.tsx`. Please make sure to **NOT** save the new Level with embedded tileset. If you're done creating the level and would like to use it in the game, export it in JSON format and store it in `quarkus-server/src/main/java/resources/maps`. Then you need to update `MapResource.java` to include this new level in the `levels` array of the `init()` method. 

If you want to change the order of the levels, please feel free to do so by updating corresponding array in `MapResource.init()`. 

Maps can be of any size. The only important thing you need to keep in mind are the names and function of the layers of a map:

- **Ground:** This is the base ground of the level. You can put any tile here.  
- **Frame:** This layer is the border of the map. Anything placed here will be used as barrier for player and enemies. Anything placed here can be destroyed with a bomb. 
- **Dekor:** Use this layer to place decorative tiles on. For example flowers on water or stones on sand. 
- **Bonus:** Use this layer to place your bonus items on. Any tile placed here can be a bonus which adds a score of 10 points. Once the player walks over it, the bonus item gets removed. Special bonus tile is the bomb, which provides 5 more bombs to the player to be used to destroy frames. Also the meat and the cheese are bonus items, which gives your player more energy. Have a look at the `Terrain.tsx` tileset. The bonus items are all placed on the lower left corner of the tileset image.
- **Persons:** This layer will be used to place the player and enemies on. Use the corresponding tiles as player and enemies. Note, you MUST not place more than one player, but you CAN place more than one enemy. If you want to use the spider enemy, you also have to provide the Persons layer's properties:
  - enemyEmitterActive: Must be true
  - enemyNumEmitting: how many spiders should be emitted at all
  - enemyTimeEmitting: how long to wait until the enemies are being emitted in milliseconds

You might add more layers to your map. Any layer placed on top of **Persons** will be drawn last, which means it will draw over enemies and player sprites.
