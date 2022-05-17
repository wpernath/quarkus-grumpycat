package org.wanja.fatcat;

import javax.inject.Inject;
import javax.ws.rs.Path;

@Path("/enemy")
public class EnemyResource {
    
    @Inject
    MazeResource mazes;

    
}
