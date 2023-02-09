package org.wanja.fatcat.mp;


import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import javax.enterprise.context.ApplicationScoped;

import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;

import org.wanja.fatcat.model.MultiPlayerGame;
import org.wanja.fatcat.model.MultiplayerMessage;
import org.wanja.fatcat.mp.model.MultiplayerMessageEncoder;
import org.wanja.fatcat.mp.model.MultiplayerMessageDecoder;

import io.quarkus.logging.Log;





@ApplicationScoped
@ServerEndpoint(
    value = "/multiplayer/{gameId}/{playerId}",
    encoders = {MultiplayerMessageEncoder.class},
    decoders = {MultiplayerMessageDecoder.class}
)
public class MultiplayerSocket {
    
    // each player has its WebSocket session
    Map<Long, Session> playerSessions = new ConcurrentHashMap<>();

    // a gameId / game list
    Map<Long, MultiPlayerGame> gameIdGames = new ConcurrentHashMap<>();

    // a map containing gameId --> Set of players in game
    Map<Long, Set<Long>> playersInGame = new ConcurrentHashMap<>();

    @OnOpen   
    public void onOpen(Session session, @PathParam("gameId") Long gameId, @PathParam("playerId") Long playerId ) {
        MultiPlayerGame game = null;
        Set<Long> players = playersInGame.get(gameId);

        if( !playersInGame.containsKey(gameId)) { // host is opening the game
            Log.info("New multiplayer session with game " + gameId + " hosted by " + playerId);

            // initialize a map gameId --> set<Player>
            players = new HashSet<>();
            players.add(playerId);
            playersInGame.put(gameId, players);

            // initialize a game
            game = new MultiPlayerGame();
            game.id = gameId;            
            gameIdGames.put(gameId, game);
            game.player1Id = playerId;
        }
        else { // game is existing, we have another player for it
            game = gameIdGames.get(gameId);            
            Log.info("A new player " + playerId + " joins multiplayer session with game " + gameId );
            if( game.player2Id == null ) game.player2Id = playerId;
            else if( game.player3Id == null) game.player3Id = playerId;
            else if( game.player4Id == null ) game.player4Id = playerId;
            else {
                // game already full
                Log.info("Game " + gameId + " is allready full");
                session.getAsyncRemote().sendObject("game full", res -> {
                    try {session.close();} catch(Exception e) {}
                });
                return;
            }
            players.add(playerId);

            broadcastOthersInGame(gameId, MultiplayerMessage.playerJoined(playerId, gameId));
            
        }        
        playerSessions.put(playerId, session);        
    }

    @OnClose    
    public void onClose(Session session, @PathParam("gameId") Long gameId, @PathParam("playerId") Long playerId) {
        playerSessions.remove(playerId);        
        Set<Long> players = playersInGame.get(gameId);

        MultiPlayerGame game = gameIdGames.get(gameId);
        if( game != null ) {
            MultiplayerMessage mm = MultiplayerMessage.playerRemoved(playerId, gameId);
            Log.info("Player " + playerId + " is leaving game " + gameId);

            // remove player from set
            players.remove(playerId);

            // Check to see if host is leaving game --> Game CLOSE
            if( game.player1Id == playerId) {
                mm.message = "Host has left the game. Game will be closed.";
                broadcastOthersInGame(gameId, mm);

                // game closed
                Log.info("Closing Multiplayer Game " + game.id );
                broadcastOthersInGame(gameId, MultiplayerMessage.gameClosing(gameId));

                // delete this game entirely from the list
                playersInGame.remove(gameId);
                gameIdGames.remove(gameId);
                return;
            }
            else {
                if( game.player2Id == playerId) {
                    game.player2 = null;
                    mm.message = "Player 2 removed";
                }
                else if( game.player3Id == playerId) {
                    game.player3 = null;
                    mm.message = "Player 3 removed";                    
                }
                else if( game.player4Id == playerId) {
                    game.player4 = null;
                    mm.message = "Player 4 removed";                    
                }
                else {
                    Log.error("Player " + playerId + " did not belong to game " + gameId);
                    return;
                }                        
                broadcastOthersInGame(gameId, mm);
            }
        }
    }

    @OnError
    public void onError(Session session, @PathParam("gameId") Long gameId, @PathParam("playerId") Long playerId, Throwable error) {
        Log.error("Player " + playerId + " needs to be removed from game " + gameId, error);
        onClose(session, gameId, playerId);
    }

    @OnMessage    
    public void onMessage(MultiplayerMessage message, @PathParam("gameId") Long gameId, @PathParam("playerId") Long playerId) {
        broadcastOthersInGame(gameId, message);
    }

    /**
     * Broadcasting a message to all players in a game. 
     * 
     * @param gameId the game to broadcast to
     * @param message the message to broadcast
     */
    private void broadcastOthersInGame(Long gameId, MultiplayerMessage message) {
        Set<Long> players = playersInGame.get(gameId);
        Long playerId = message.playerId;
        if (players != null) {
            players.forEach(pid -> {
                if (pid != playerId) { // broadcast only to others in this game!
                    Log.debug("Broadcasting message to " + pid);
                    playerSessions.get(pid).getAsyncRemote().sendObject(message, res -> {
                        if (res.getException() != null) {
                            Log.error("Updating message to " + pid + " in game " + gameId + " failed!",
                                    res.getException());
                        }
                    });
                }
            });
        }

    }

}
