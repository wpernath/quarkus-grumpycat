package org.wanja.grumpycat;

import javax.enterprise.context.ApplicationScoped;

import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.eclipse.microprofile.reactive.messaging.Outgoing;
import org.wanja.grumpycat.model.EnemyAction;


import io.quarkus.logging.Log;


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
