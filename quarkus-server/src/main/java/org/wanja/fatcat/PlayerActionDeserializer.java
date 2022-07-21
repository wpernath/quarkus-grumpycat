package org.wanja.fatcat;

import io.quarkus.kafka.client.serialization.ObjectMapperDeserializer;
import org.wanja.fatcat.model.PlayerAction;

public class PlayerActionDeserializer extends ObjectMapperDeserializer<PlayerAction> {
    public PlayerActionDeserializer() {
        super(PlayerAction.class);
    }
    
}
