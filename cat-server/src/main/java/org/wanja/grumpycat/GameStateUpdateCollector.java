package org.wanja.grumpycat;

import javax.enterprise.context.ApplicationScoped;

import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.eclipse.microprofile.reactive.messaging.Outgoing;
import org.wanja.grumpycat.model.PlayerAction;

import io.quarkus.logging.Log;

@ApplicationScoped
public class GameStateUpdateCollector {
    
    //@Channel("player-actions")
    //Emitter<PlayerAction> actionEmitter;


    @Incoming("incoming-states")   
    @Outgoing("player-actions") 
    PlayerAction collectPlayer(PlayerAction action) {        
        if( action.gameId == null || action.playerId == null ) {
            Log.warn("Skipping game state action, because gameId || playerId is NULL");
            return null;
        }
        else {
            //actionEmitter.send(action);            
            Log.debug("Sending game action to Kafka");
            return action;
        }
    }
}
