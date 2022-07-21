package org.wanja.fatcat;

import java.util.List;

import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;

import org.eclipse.microprofile.reactive.messaging.Outgoing;
import org.wanja.fatcat.model.PlayerAction;

import io.quarkus.logging.Log;

@Path("/movement")
public class PlayerMovementResource {
    
    @POST
    public PlayerAction createMovement(PlayerAction action) {
        action.id = null; 
        return action;
    }

    @GET
    @Path("/{gameId}/{playerId}")
    public List<PlayerAction> movementsForGame(long gameId, long playerId) {
        Log.info("Loading movements from game " + gameId + " and player " + playerId );
        List<PlayerAction> res = PlayerAction
                .list("gameId = ?1 and playerId = ?2 order by time", gameId, playerId);                
        return res;
    }
}
