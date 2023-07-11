package org.wanja.fatcat.mp;

import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

import io.quarkus.qute.Template;
import io.quarkus.qute.TemplateInstance;
import io.smallrye.common.annotation.Blocking;

@Path("/reports")
public class ReportResource {
    
    @Inject
    Template openGames;

    /*
    @Inject
    SecurityIdentity identity;
    */

    @Inject
    MultiPlayerResource multiPlayerResource;

    @Path("/open-games")
    @GET
    @Produces(MediaType.TEXT_PLAIN)
    @Blocking
    //@RolesAllowed("user")
    public TemplateInstance listOpenGames() {
        return openGames.data(
            "games", 
            multiPlayerResource.listOpenGames()
        );
    }

    @Inject
    Template finishedGames;


    @Path("/finished-games")
    @GET
    @Produces(MediaType.TEXT_PLAIN)
    @Blocking
    //@RolesAllowed("user")
    public TemplateInstance listFinishedGames() {
        return finishedGames.data("games", multiPlayerResource.listFinishedGames());
    }


    @Inject
    Template runningGames;

    @Path("/running-games")
    @GET
    @Produces(MediaType.TEXT_PLAIN)
    @Blocking
    //@RolesAllowed("user")
    public TemplateInstance listRunningGames() {
        return runningGames.data("games", multiPlayerResource.listRunningGames());
    }

}
