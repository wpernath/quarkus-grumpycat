package org.wanja.fatcat;

import java.util.List;

import javax.transaction.Transactional;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;

import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.wanja.fatcat.model.Game;
import org.wanja.fatcat.model.Player;

import io.quarkus.logging.Log;
import io.quarkus.panache.common.Sort;
import io.quarkus.panache.common.Sort.Direction;

@Path("/game")
@Consumes("application/json")
@Produces("application/json")
public class GameResource {

    @ConfigProperty( name = "application.version")
    String versionString;

    @ConfigProperty( name = "quarkus.application.name")
    String appName;

    @POST
    @Transactional
    public Game createNewGame(Game game) {
        Game g = new Game();
        if( game.player == null ) {
            g.player = new Player(game.name);
        }
        else {
            g.player = game.player;
        }
        g.level  = game.level;
        g.name   = game.name;
        g.player.persist();
        g.persist();

        Log.info("New game created with ID " + g.id + " for player " + g.player.name + " (id=" + g.player.id + ")");
        return g;
    }

    @GET
    public List<Game> listGames() {
        return Game.listAll(Sort.by("time", Direction.Descending));
    }

    @GET
    @Path("/{id}")
    public Game game(long id) {
        return Game.findById(id);
    }

    @GET
    @Path("/version")
    //@Produces("text/plain")
    public AppVersion version() {
        return new AppVersion("grumpycat-server", this.appName, this.versionString);
    }

    final class AppVersion {
        public String appName;
        public String internalName;
        public String appVersion;

        public AppVersion() {
        }
        public AppVersion(String n, String i, String v) {
            this.appName = n;
            this.appVersion = v;
            this.internalName = i;
        }
    }

}
