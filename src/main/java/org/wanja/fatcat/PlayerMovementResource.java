package org.wanja.fatcat;

import java.util.Comparator;
import java.util.List;

import javax.transaction.Transactional;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;

import org.wanja.fatcat.model.Game;
import org.wanja.fatcat.model.PlayerAction;

import io.quarkus.logging.Log;

@Path("/movement")
public class PlayerMovementResource {
    
    @POST
    @Transactional
    public void createMovement(PlayerAction action) {
        //PlayerAction pa = new PlayerAction();
        action.id = null;
        action.persist();

        //Log.debug("new player action created for game id: "+ pa.gameId + " ");
    }

    @GET
    @Path("/{gameId}/{playerId}")
    public List<PlayerAction> movementsForGame(long gameId, long playerId) {
        Log.info("Loading movements from game " + gameId + " and player " + playerId );
        List<PlayerAction> res = PlayerAction
                .list("gameId = ?1 and playerId = ?2 order by time", gameId, playerId);                
        // res.sort(new Comparator<PlayerAction>() {                    
        //     public int compare(PlayerAction o1, PlayerAction o2) {                        
        //         return o1.time.compareTo(o2.time);
        //     }                    
        // });

        return res;
    }
}
