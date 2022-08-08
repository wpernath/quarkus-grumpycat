package org.wanja.fatcat;

import java.util.List;
import java.util.Set;

import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.WebApplicationException;

import org.wanja.fatcat.model.EnemyAction;
import org.wanja.fatcat.model.PlayerAction;

import io.quarkus.logging.Log;

@Path("/state")
public class PlayerMovementResource {
    
    //@Channel("player-actions")
    //Emitter<PlayerAction> actionEmitter;

    /**
     * Takes the REST playerAction and emitts a new message 
     * which will then be processed by the PlayerMovementProcessor
     * @param gameId the gameid to be used
     * @param playerId the player to be used
     * @param actions list of actions to be saved
     */
    @POST
    @Path("/{gameId}/{playerId}")
    public void createMovements(Long gameId, Long playerId, Set<PlayerAction> actions) {
        Log.info("Request to save player actions for game " + gameId);
        if( gameId != null && playerId != null && actions != null && actions.size() > 0 ) {
            for(PlayerAction a : actions ) {

                if( a == null ) continue;
                a.id = null;
                a.playerId = playerId;
                a.gameId   = gameId;
                //actionEmitter.send(a);
            }
        }
        else {
            throw new WebApplicationException("createMovement: gameId and/or playerId must NOT be null");
        }
    }

    @GET
    @Path("/player/{gameId}/{playerId}")
    public List<PlayerAction> movementsForGame(long gameId, long playerId) {
        Log.info("Loading player movements from game " + gameId + " and player " + playerId );
        List<PlayerAction> res = PlayerAction
                .list("gameId = ?1 and playerId = ?2 order by time", gameId, playerId);                
        return res;
    }

    @GET
    @Path("/enemy/{gameId}/{playerId}")
    public List<EnemyAction> movementsForEnemy(long gameId, long playerId) {
        Log.info("Loading enemy movements from game " + gameId + " and player " + playerId);
        List<EnemyAction> res = EnemyAction
                .list("gameId = ?1 and playerId = ?2 order by type, name, time", gameId, playerId);
        return res;
    }

}
