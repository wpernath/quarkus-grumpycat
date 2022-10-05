package org.wanja.grumpycat;

import org.wanja.grumpycat.model.EnemyAction;

import io.quarkus.kafka.client.serialization.ObjectMapperDeserializer;


public class EnemyActionDeserializer extends ObjectMapperDeserializer<EnemyAction> {
    public EnemyActionDeserializer() {
        super(EnemyAction.class);
    }
    
}
