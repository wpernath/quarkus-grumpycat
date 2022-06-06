package org.wanja.fatcat;

import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;

@Path("/enemy")
public class EnemyResource {
    

    @GET
    public Cat calculateNextMovement(Cat cat, int playerX, int playerY) {
        return null;
    }
}
