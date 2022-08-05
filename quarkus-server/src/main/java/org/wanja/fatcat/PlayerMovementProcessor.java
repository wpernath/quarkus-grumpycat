package org.wanja.fatcat;

import javax.enterprise.context.ApplicationScoped;
import javax.transaction.Transactional;

import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.wanja.fatcat.model.EnemyAction;
import org.wanja.fatcat.model.PlayerAction;

import io.quarkus.logging.Log;
import io.smallrye.reactive.messaging.annotations.Blocking;

@ApplicationScoped
public class PlayerMovementProcessor {
    
    /**
     * stores the player action into the database
     * @param action
     */
    @Incoming("player-actions")
    @Blocking
    @Transactional
    public void processPlayerAction(PlayerAction action) {
        if (action.gameId == null || action.playerId == null)
            throw new IllegalArgumentException("Neither gameId nor playerId must be null");

            Log.info("Logging player action for " + action.gameId);
        action.persist();

        /* 
        for( EnemyAction ea : action.enemies) {
            ea.playerActionId = action.id;
            ea.persist();
        }*/
    }

    public void processEnemyAction(EnemyAction action) {
        if (action.gameId == null || action.playerId == null)
            throw new IllegalArgumentException("Neither gameId nor playerId must be null");

        Log.info("Logging player action for " + action.gameId);
        action.persist();
    }

}
