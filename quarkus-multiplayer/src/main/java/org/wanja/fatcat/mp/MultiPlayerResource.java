package org.wanja.fatcat.mp;

import java.util.Date;
import java.util.List;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.Response.Status;

import org.wanja.fatcat.model.MultiPlayer;
import org.wanja.fatcat.model.Player;
import org.wanja.fatcat.mp.model.MultiPlayerGame;

import io.quarkus.hibernate.reactive.panache.Panache;

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
    public Uni<MultiPlayerGame> createGame(MultiPlayerPlayerGame gamestr) {
        return Panache.withTransaction( () -> {
            MultiPlayerGame game = gamestr.game;
            MultiPlayer     host = gamestr.host;
            
            game.player1 = host;
            game.player1Id = host.id;
            game.isClosed = false;
            game.isRunning = false;
            game.isFinished = false;
            game.isOpen = true;
            game.timeStarted = new Date();        

            MultiPlayerGame.persist(game);
        })
        ;        
    }

    @PUT
    @Path("/close/{gameId}/{playerId}")    
    public void closeGame(Long gameId, Long playerId) {
        MultiPlayerGame.<MultiPlayerGame> findById(gameId).subscribe().with(game -> {            
            if (game != null) {
                if (!game.isFinished) {
                    // remove player from game. If it's player1, we close the entire game
                    if (game.player1Id == playerId) {
                        Panache.withTransaction( () -> MultiPlayerGame.deleteById(gameId));
                    } 
                    else {
                        if (game.player2Id == playerId) {
                            game.player2 = null;
                            game.player2Id = null;
                            Panache.withTransaction( () -> MultiPlayerGame.persist(game));
                        } 
                        else if (game.player3Id == playerId) {
                            game.player3 = null;
                            game.player3Id = null;
                            Panache.withTransaction( () -> MultiPlayerGame.persist(game));
                        } 
                        else if (game.player3Id == playerId) {
                            game.player4 = null;
                            game.player4Id = null;
                            Panache.withTransaction( () -> MultiPlayerGame.persist(game));
                        }
                    }
                } 
                else {
                    game.timeStopped = new Date();
                    Panache.withTransaction( () -> MultiPlayerGame.persist(game));
                }
            }
        });
    }

    @PUT
    @Path("/finish/{gameId}")
    public Uni<MultiPlayerGame> finishGame(Long gameId, MultiPlayerGame g) {
        return Panache.withTransaction(
            () -> MultiPlayerGame.<MultiPlayerGame> findById(gameId)
            .onItem().ifNotNull().invoke( game -> {
                Log.info("Finishing MP game with ID " + gameId);
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
            })
            .onItem().ifNull().invoke( () -> {
                Log.info("Can't find MP game with ID " + gameId);
            })
            .onItem().ifNull().continueWith(Response.ok().status(Status.NOT_FOUND)::build)
        );   
    }

    @PUT
    @Path("/start/{gameId}")    
    public void startGame(Long gameId) {
        Panache.withTransaction(
            () -> MultiPlayerGame.<MultiPlayerGame> findById(gameId)
            .onItem().ifNotNull().invoke(game -> {
                Log.info("Starting game with ID " + gameId);
                game.isOpen = false;
                game.isRunning = true;
                game.isFinished = false;
                game.timePlaying = new Date();

                game.persist();
            })
        );
    }


    @PUT  
    @Path("/join/{gameId}/{playerId}")
    public Uni<MultiPlayerGame> joinGame(Long gameId, Long playerId ) {

        Panache.withTransaction( () -> MultiPlayerGame.<MultiPlayerGame> findById(gameId)
            .onItem().ifNotNull().invoke( game -> {

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
    public Uni<MultiPlayer> createMultiPlayerFromPlayer(Player p) {
        return Panache.withTransaction( () -> {
            MultiPlayer mp = new MultiPlayer(p);
            mp.persist();
            Log.info("New Multiplayer Player created with id " + mp.id);
        });
    }

    @PUT
    @Path("/player/{playerId}")
    public MultiPlayer updatePlayerData(Long playerId, MultiPlayer player) {
        Log.info("Persisting MP player with id " + playerId);
        Panache.withTransaction(
                    () -> MultiPlayerGame.<MultiPlayerGame> findById(gameId)
            .onItem().ifNotNull().invoke( game -> {

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
