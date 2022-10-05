package org.wanja.grumpycat.cat.model.deployment;

import io.quarkus.deployment.annotations.BuildStep;
import io.quarkus.deployment.builditem.FeatureBuildItem;

class CatModelProcessor {

    private static final String FEATURE = "cat-model";

    @BuildStep
    FeatureBuildItem feature() {
        return new FeatureBuildItem(FEATURE);
    }

    

}
