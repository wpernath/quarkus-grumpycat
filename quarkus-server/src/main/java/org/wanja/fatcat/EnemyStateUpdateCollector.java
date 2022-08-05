package org.wanja.fatcat;

import javax.enterprise.context.ApplicationScoped;
import javax.transaction.Transactional;
import javax.ws.rs.Path;

import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.eclipse.microprofile.reactive.messaging.Outgoing;
import org.wanja.fatcat.model.EnemyAction;
import org.wanja.fatcat.model.PlayerAction;

import io.quarkus.logging.Log;

import org.eclipse.microprofile.reactive.messaging.Channel;
import org.eclipse.microprofile.reactive.messaging.Emitter;

@ApplicationScoped
public class EnemyStateUpdateCollector {
    
    //@Channel("enemy-actions")
    //Emitter<EnemyAction> enemyEmitter;

    @Incoming("incoming-enemy")    
    @Outgoing("enemy-actions")
    //@Transactional
    EnemyAction collectEnemy(EnemyAction action) {
        if (action.gameId == null || action.playerId == null) {
            Log.warn("Skipping enemy state action, because gameId || playerId is NULL");         
            return null;
        } 
        else {
            //enemyEmitter.send(action);
            //action.persist();
            Log.debug("Sending game action to Kafka");        
            return action;
        }

    }
}
