package org.wanja.grumpycat;

import org.wanja.grumpycat.model.PlayerAction;

import io.quarkus.kafka.client.serialization.ObjectMapperDeserializer;


public class PlayerActionDeserializer extends ObjectMapperDeserializer<PlayerAction> {
    public PlayerActionDeserializer() {
        super(PlayerAction.class);
    }
    
}
