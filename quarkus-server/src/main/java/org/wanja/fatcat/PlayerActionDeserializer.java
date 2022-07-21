package org.wanja.fatcat;

import org.wanja.fatcat.model.PlayerAction;

import io.quarkus.kafka.client.serialization.ObjectMapperDeserializer;


public class PlayerActionDeserializer extends ObjectMapperDeserializer<PlayerAction> {
    public PlayerActionDeserializer() {
        super(PlayerAction.class);
    }
    
}
