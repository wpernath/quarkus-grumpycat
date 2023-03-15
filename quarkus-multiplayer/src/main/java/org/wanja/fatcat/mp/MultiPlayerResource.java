package org.wanja.fatcat.mp;

import java.util.Date;
import java.util.List;

import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;

import org.wanja.fatcat.model.MultiPlayer;
import org.wanja.fatcat.model.Player;
import org.wanja.fatcat.mp.model.MultiPlayerGame;

import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.hibernate.reactive.panache.common.runtime.ReactiveTransactional;
import io.quarkus.logging.Log;
import io.smallrye.mutiny.Uni;

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
    @ReactiveTransactional
    public Uni<MultiPlayerGame> createGame(MultiPlayerPlayerGame gamestr) {
        MultiPlayerGame game = gamestr.game;
        MultiPlayer     host = gamestr.host;
        
        game.player1 = host;
        game.player1Id = host.id;
        game.isClosed = false;
        game.isRunning = false;
        game.isFinished = false;
        game.isOpen = true;
        game.timeStarted = new Date();        
        return game.persist();
        /*
        .subscribe().with( g -> {
            Log.info("(with)New Multiplayer game created with id: " + g.id);
        });
        */
    }

    @PUT
    @Path("/close/{gameId}/{playerId}")
    @ReactiveTransactional
    public void closeGame(Long gameId, Long playerId) {
        MultiPlayerGame.findById(gameId).subscribe().with(g -> {
            MultiPlayerGame game = (MultiPlayerGame )g;
            if (game != null) {
                if (!game.isFinished) {
                    // remove player from game. If it's player1, we close the entire game
                    if (game.player1Id == playerId) {
                        game.delete();
                    } 
                    else {
                        if (game.player2Id == playerId) {
                            game.player2 = null;
                            game.player2Id = null;
                            game.persist();
                        } 
                        else if (game.player3Id == playerId) {
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
                else {
                    game.timeStopped = new Date();
                    game.persist();
                }
            }

        });
    }

    @PUT
    @Path("/finish/{gameId}")
    @ReactiveTransactional
    public MultiPlayerGame finishGame(Long gameId, MultiPlayerGame g) {
        MultiPlayerGame game = MultiPlayerGame.findById(gameId);
        Log.info("Finishing MP game with ID " + gameId);
        if( game != null ) {
            game.isOpen = false;
            game.isFinished = true;
            game.isRunning = false;
            game.isClosed = true;
            game.timeFinished = new Date();

            if( g.player1 != null ) {
                game.player1 = updatePlayerData(g.player1.id, g.player1);
            }
            if (g.player2 != null) {
                game.player2 = updatePlayerData(g.player2.id, g.player2);
            }
            if (g.player3 != null) {
                game.player3 = updatePlayerData(g.player3.id, g.player3);
            }
            if (g.player4 != null) {
                game.player4 = updatePlayerData(g.player4.id, g.player4);
            }

            game.persist();
        }
        return game;
    }

    @PUT
    @Path("/start/{gameId}")
    @ReactiveTransactional
    public void startGame(Long gameId) {
        MultiPlayerGame game = MultiPlayerGame.findById(gameId);
        if (game != null) {
            game.isOpen = false;
            game.isRunning = true;
            game.isFinished = false;
            game.timePlaying = new Date();
            game.persist();
        }
    }


    @PUT  
    @Path("/join/{gameId}/{playerId}")
    @ReactiveTransactional
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
    @ReactiveTransactional
    public MultiPlayer createMultiPlayerFromPlayer(Player p) {
        MultiPlayer mp = new MultiPlayer(p);
        mp.persist();
        Log.info("New Multiplayer Player created with id " + mp.id);
        return mp;
    }

    @PUT
    @Path("/player/{playerId}")
    @ReactiveTransactional
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
        mp.hasWon    = player.hasWon;
        mp.internalScore = player.internalScore;
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
        return MultiPlayerGame.list("isClosed=false and isFinished=false and isRunning=false and isOpen=true order by timeStarted desc");
    }

    @GET
    @Path("/running")
    public List<MultiPlayerGame> listRunningGames() {
        return MultiPlayerGame.list("isClosed=false and isFinished=false and isRunning=true and isOpen=false order by timeStarted desc");
    }

    @GET
    @Path("/finished")
    public List<MultiPlayerGame> listFinishedGames() {
        return MultiPlayerGame.list("isFinished=true and isRunning=false and isOpen=false order by timeFinished desc");
    }

    @GET
    @Path("/open/{playerId}")
    public List<MultiPlayerGame> myOpenGames(Long playerId) {
        return MultiPlayerGame.find("isOpen = true and isClosed=false AND (player1Id = ?1 or player2Id = ?1 or player3Id = ?1 or player4Id = ?1)", playerId).list();
    }

    @GET
    @Path("/finished/{playerId}")
    public List<MultiPlayerGame> myFinishedGames(Long playerId) {
        return MultiPlayerGame.find(
                "isFinished = true and isClosed=false AND (player1Id = ?1 or player2Id = ?1 or player3Id = ?1 or player4Id = ?1)",
                playerId).list();
    }

}
