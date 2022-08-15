package org.wanja.fatcat;


import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import javax.enterprise.context.ApplicationScoped;
import javax.transaction.Transactional;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;

import org.wanja.fatcat.model.MultiPlayer;
import org.wanja.fatcat.model.MultiPlayerGame;
import org.wanja.fatcat.model.MultiplayerMessage;
import org.wanja.fatcat.model.MultiplayerMessageEncoder;
import org.wanja.fatcat.model.MultiplayerMessageDecoder;

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

    // a playerId to player association
    Map<Long, MultiPlayer> playerIdPlayer = new ConcurrentHashMap<>();

    // a map containing gameId --> Set of players in game
    Map<Long, Set<Long>> playersInGame = new ConcurrentHashMap<>();

    @OnOpen
    @Transactional
    public void onOpen(Session session, @PathParam("gameId") Long gameId, @PathParam("playerId") Long playerId ) {
        MultiPlayerGame game = null;
        MultiPlayer     player = MultiPlayer.findById(playerId);
        Set<Long> players = playersInGame.get(gameId);

        if( !gameIdGames.containsKey(gameId)) { // host is opening the game
            players = new HashSet<>();
            players.add(playerId);
            playersInGame.put(gameId, players);

            game = MultiPlayerGame.findById(gameId);
            gameIdGames.put(gameId, game);
            game.player1 = player;
            game.persist();
        }
        else { // game is existing, we have another player for it
            game = gameIdGames.get(gameId);            
            if( game.player2 == null ) game.player2 = player;
            else if( game.player3 == null) game.player3 = player;
            else if( game.player4 == null ) game.player4 = player;
            else {
                // game already full
                Log.info("Game " + gameId + " is allready full");
                session.getAsyncRemote().sendObject("game full", res -> {
                    try {session.close();} catch(Exception e) {}
                });
                return;
            }
            players.add(playerId);
        }
        playerIdPlayer.put(playerId, player);
        playerSessions.put(playerId, session);
        game.persist();
        
    }

    @OnClose
    @Transactional
    public void onClose(Session session, @PathParam("gameId") Long gameId, @PathParam("playerId") Long playerId) {
        playerSessions.remove(playerId);
        playerIdPlayer.remove(playerId);
        Set<Long> players = playersInGame.get(gameId);

        MultiPlayerGame game = gameIdGames.get(gameId);
        if( game.player1.id == playerId) {
            // game closed
            playersInGame.remove(gameId);
            gameIdGames.remove(gameId);
            game.delete();            
            return;
        }
        else if( game.player2.id == playerId) {
            game.player2 = null;
            players.remove(playerId);
            game.persist();
        }
        else if( game.player3.id == playerId) {
            game.player3 = null;
            players.remove(playerId);
            game.persist();
        }
        else if( game.player4.id == playerId) {
            game.player4 = null;
            players.remove(playerId);
            game.persist();
        }
        else {
            Log.error("Player " + playerId + " did not belong to game " + gameId);
        }        
    }

    @OnError
    public void onError(Session session, @PathParam("gameId") Long gameId, @PathParam("playerId") Long playerId, Throwable error) {
        Log.error("Player " + playerId + " needs to be removed from game " + gameId);
        onClose(session, gameId, playerId);
    }

    @OnMessage
    public void onMessage(MultiplayerMessage message, @PathParam("gameId") Long gameId, @PathParam("playerId") Long playerId) {
        MultiPlayerGame game = gameIdGames.get(gameId);
        MultiPlayer player = playerIdPlayer.get(playerId);
        Set<Long> players = playersInGame.get(gameId);
        if( game != null && player != null && players != null ) {
            players.forEach(pid -> {
                if(pid != playerId ) { // broadcast only to others in this game!
                    playerSessions.get(pid).getAsyncRemote().sendObject(message, res -> {
                        if( res.getException() != null ) {
                            Log.error("Updating message to " + pid + " in game " + gameId + " failed!", res.getException());
                        }
                    });
                }
            });
        }
    }
}
