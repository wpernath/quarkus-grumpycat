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
//@Path("/state-collector")
public class EnemyStateUpdateCollector {
    
    //@Channel("enemy-actions")
    //Emitter<EnemyAction> enemyEmitter;



    @Incoming("incoming-enemy")
    @Outgoing("outgoing-enemy")
    @Transactional
    boolean collectEnemy(EnemyAction action) {
        System.out.println("collectEnemy() " + action.toString());
        if (action.gameId == null || action.playerId == null) {
            Log.info("Skipping enemy state action, because gameId || playerId is NULL");
            return false;
        } else {
            //enemyEmitter.send(action);
            action.persist();
            Log.info("Sending game action to Kafka");
            return true;
        }
    }
}
