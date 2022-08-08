package org.wanja.fatcat;

import org.wanja.fatcat.model.EnemyAction;

import io.quarkus.kafka.client.serialization.ObjectMapperDeserializer;


public class EnemyActionDeserializer extends ObjectMapperDeserializer<EnemyAction> {
    public EnemyActionDeserializer() {
        super(EnemyAction.class);
    }
    
}
