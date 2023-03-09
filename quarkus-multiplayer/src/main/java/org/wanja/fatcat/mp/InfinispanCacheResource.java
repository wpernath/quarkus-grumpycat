package org.wanja.fatcat.mp;

import java.util.Set;
import java.util.Date;

import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;

import org.infinispan.client.hotrod.RemoteCache;
import org.wanja.fatcat.mp.model.MultiPlayerGame;

import io.quarkus.infinispan.client.Remote;

@Path("/cache")
public class InfinispanCacheResource {

    @Inject
    @Remote("cat-games")
    RemoteCache<Long, MultiPlayerGame> gameCache;

    @GET
    public Set<Long> allGames() {
        return gameCache.keySet();
    }

    @GET
    @Path("{id}")
    public MultiPlayerGame getGame(@PathParam("id") Long id) {
        return gameCache.get(id);
    }

    @PUT
    @Path("{id}")
    public Set<Long> addGame(@PathParam("id") Long id) {
        MultiPlayerGame mpg = new MultiPlayerGame();
        mpg.id = id;
        mpg.timeStarted = new Date(System.currentTimeMillis());
        mpg.isClosed = true;
        mpg.player1Id= (long )165;
        gameCache.put(id, mpg);
        return allGames();
    }
}
