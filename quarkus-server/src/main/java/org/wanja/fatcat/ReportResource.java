package org.wanja.fatcat;

import javax.annotation.security.RolesAllowed;
import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import io.quarkus.qute.Template;
import io.quarkus.qute.TemplateInstance;
import io.quarkus.security.Authenticated;
import io.quarkus.security.identity.SecurityIdentity;
import io.smallrye.common.annotation.Blocking;

@Path("/reports")
//@Authenticated
public class ReportResource {
    
    @Inject
    Template openGames;

    //@Inject
    //SecurityIdentity identity;

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
