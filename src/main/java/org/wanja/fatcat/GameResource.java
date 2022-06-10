package org.wanja.fatcat;

import java.util.List;

import javax.transaction.Transactional;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;

import org.jboss.resteasy.annotations.jaxrs.PathParam;
import org.wanja.fatcat.model.Game;
import org.wanja.fatcat.model.Player;

import io.quarkus.logging.Log;

@Path("/game")
@Consumes("application/json")
@Produces("application/json")
public class GameResource {

    @POST
    @Transactional
    public Game createNewGame(Game game) {
        Game g = new Game();
        g.player = new Player(game.name);
        g.level  = game.level;
        g.name   = game.name;
        g.player.persist();
        g.persist();

        Log.info("New game created with ID " + g.id + " for player " + g.player.name + " (id=" + g.player.id + ")");
        return g;
    }

    @GET
    public List<Game> listGames() {
        return Game.listAll();
    }

    @GET
    @Path("/{id}")
    public Game game(@PathParam long id) {
        return Game.findById(id);
    }
}
