package org.wanja.fatcat.mp.model;

import org.infinispan.protostream.GeneratedSchema;
import org.infinispan.protostream.annotations.AutoProtoSchemaBuilder;

@AutoProtoSchemaBuilder(includeClasses = {MultiPlayerGame.class}, schemaPackageName = "cat_multiplayer")
interface MultiplayerSchema extends GeneratedSchema {
    
}
