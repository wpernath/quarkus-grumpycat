package org.wanja.fatcat;

import java.util.ArrayList;
import java.util.List;

import javax.inject.Inject;
import javax.transaction.Transactional;
import javax.transaction.Transactional.TxType;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;

import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.wanja.fatcat.model.Game;
import org.wanja.fatcat.model.Player;
import org.wanja.fatcat.model.PlayerAction;

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

    @Inject
    PlayerMovementResource playerMovements;

    @POST
    @Transactional(TxType.REQUIRED)
    public Game createNewGame(Game game) {
        Game g = new Game();
        if( game.player == null ) {
            g.player = new Player(game.name);            
        }
        else {            
            g.player = game.player;
            g.playerId = game.player.id;
        }

        if( g.player.id == null ) {
            g.player.persist();
        }

        g.playerId = g.player.id;
        g.level  = game.level;
        g.name   = game.name;

        Log.info("Persisting Game: " + g.toString());
        g.persist();

        Log.info(g.toString());
        Log.info("New game created with ID " + g.id + " for player " + g.player.name + " (id=" + g.player.id + ")");
        return g;
    }

    @GET
    public List<Game> listGames() {            
        List<Game> games = Game.listAll(Sort.by("time", Direction.Descending));
        List<Game> gamesWithMovements = new ArrayList<Game>();
        
        for( Game g : games ) {            
            Log.info("Trying to read movements from Game " + g.id );
            List<PlayerAction> actions = playerMovements.movementsForGame(g.id, g.player.id);

            if( actions != null && actions.size() > 5 ) {
                gamesWithMovements.add(g);
            }
        }
        return gamesWithMovements;
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
