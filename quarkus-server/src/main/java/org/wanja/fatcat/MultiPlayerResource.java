package org.wanja.fatcat;

import java.util.Date;
import java.util.List;

import javax.transaction.Transactional;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;

import org.wanja.fatcat.model.MultiPlayer;
import org.wanja.fatcat.model.MultiPlayerGame;
import org.wanja.fatcat.model.Player;

import io.quarkus.logging.Log;

@Path("/mp-game")
public class MultiPlayerResource {

    public static class MultiPlayerPlayerGame {
        public MultiPlayerGame game;
        public MultiPlayer host;

        MultiPlayerPlayerGame() {

        }
    }


    /**
     * Creates a new MP game. 
     * @param game a structure which contains a prefilled game and the player who acts as host
     * @return creates the game in db and returns all structures
     */
    @POST
    @Path("/new")
    @Transactional
    public MultiPlayerGame createGame(MultiPlayerPlayerGame gamestr) {
        MultiPlayerGame game = gamestr.game;
        MultiPlayer     host = gamestr.host;
        
        game.player1 = host;
        game.player1Id = host.id;
        game.isClosed = false;
        game.isRunning = false;
        game.isOpen = true;
        game.timeStarted = new Date();
        game.persist();
        Log.info("New Multiplayer game created with id: " + game.id);
        return game;
    }

    @PUT
    @Path("/close/{gameId}/{playerId}")
    @Transactional
    public void closeGame(Long gameId, Long playerId) {
        MultiPlayerGame game = MultiPlayerGame.findById(gameId);
        if( game != null ) {
            // remove player from game. If it's player1, we close the entire game
            if(game.player1Id == playerId ) {
                game.delete();
            }
            else{
                if( game.player2Id == playerId) {
                    game.player2 = null;
                    game.player2Id = null;
                    game.persist();
                }
                else if( game.player3Id == playerId) {
                    game.player3 = null;
                    game.player3Id = null;
                    game.persist();
                }
                else if (game.player3Id == playerId) {
                    game.player4 = null;
                    game.player4Id = null;
                    game.persist();
                }
            }
        }
    }

    @PUT
    @Path("/start/{gameId}")
    @Transactional
    public void startGame(Long gameId) {
        MultiPlayerGame game = MultiPlayerGame.findById(gameId);
        if (game != null) {
            game.isOpen = false;
            game.isRunning = true;
            game.timePlaying = new Date();
            game.persist();
        }
    }


    @PUT  
    @Path("/join/{gameId}/{playerId}")
    @Transactional
    public MultiPlayerGame joinGame(Long gameId, Long playerId ) {
        MultiPlayerGame game = MultiPlayerGame.findById(gameId);
        MultiPlayer     player = MultiPlayer.findById(playerId);
        
        if( game != null && player != null) {
            Log.info(player.name + " (" + playerId + ") wants to join game " + gameId);
            if( game.player2 == null ) {
                game.player2 = player;
                game.player2Id = playerId;
            }
            else if( game.player3 == null ) {
                game.player3 = player;
                game.player3Id = playerId;
            }
            else if( game.player4 == null ) {
                game.player4 = player;
                game.player4Id = playerId;
            }
            else {
                throw new IllegalStateException("Game " + game.id + " is allready full");
            }
            game.persist();
            return game;
        }
        else {
            Log.error("Game " + gameId + " or player " + playerId + " not found!");
            return null;
        }
    }
     
    @POST
    @Path("/player")
    @Transactional
    public MultiPlayer createMultiPlayerFromPlayer(Player p) {
        MultiPlayer mp = new MultiPlayer(p);
        mp.persist();
        Log.info("New Multiplayer Player created with id " + mp.id);
        return mp;
    }

    @PUT
    @Path("/player/{playerId}")
    @Transactional
    public MultiPlayer updatePlayerData(Long playerId, MultiPlayer player) {
        Log.info("Persisting MP player with id " + playerId);
        MultiPlayer mp = MultiPlayer.findById(playerId);
        mp.bittenBySpiders = player.bittenBySpiders;
        mp.bonusCollected = player.bonusCollected;
        mp.catchedByCats = player.catchedByCats;
        mp.catchedByGolems = player.catchedByGolems;
        mp.catchedByRemotePlayers = player.catchedByRemotePlayers;
        mp.chestsOpened = player.chestsOpened;
        mp.energyLeft = player.energyLeft;
        mp.killedSpiders = player.killedSpiders;
        mp.otherPlayerHurt = player.otherPlayerHurt;
        mp.placedBarriers = player.placedBarriers;
        mp.potionsLeft = player.potionsLeft;
        mp.score = player.score;
        mp.stunnedCats = player.stunnedCats;
        mp.stunnedGolems = player.stunnedGolems;
        mp.usedBombs = player.usedBombs;
        mp.bombsLeft = player.bombsLeft;
        mp.persist();
        return mp;
    }

    @GET
    @Path("/{gameId}")
    public MultiPlayerGame getOpenGames(Long gameId) {
        return MultiPlayerGame.findById(gameId);
    }

    @GET
    @Path("/open")
    public List<MultiPlayerGame> listOpenGames() {
        return MultiPlayerGame.list("isClosed=false and isRunning=false and isOpen=true order by timeStarted desc");
    }

    @GET
    @Path("/running")
    public List<MultiPlayerGame> listRunningGames() {
        return MultiPlayerGame.list("isClosed=false and isRunning=true and isOpen=false order by timeStarted desc");
    }

    @GET
    @Path("/open/{playerId}")
    public List<MultiPlayerGame> myOpenGame(Long playerId) {
        return MultiPlayerGame.find("isOpen = true and isClosed=false AND (player1Id = ?1 or player2Id = ?1 or player3Id = ?1 or player4Id = ?1)", playerId).list();
    }

}
