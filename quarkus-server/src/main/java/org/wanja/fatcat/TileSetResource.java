package org.wanja.fatcat;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import jakarta.annotation.PostConstruct;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;

import org.wanja.fatcat.map.RealTileSet;

import com.fasterxml.jackson.databind.ObjectMapper;

@Path("/tileset")
public class TileSetResource {
    Map<String,RealTileSet> tileSets = new HashMap<>();

    @Inject
    ObjectMapper mapper;

    @PostConstruct
    void init() {
        // add new levels here! All levels are stored in /java/resources/maps
        String[] tilesets = new String[] {
                "Terrain",
                "bomb",
                "spiders",
        };

        try {
            for (String tileset : tilesets) {
                RealTileSet map = mapper.readValue(
                    getClass().getResourceAsStream("/maps/" + tileset + ".tsj"),
                    RealTileSet.class
                );

                // Hack to make sure, tileset is properly loaded as
                // MapEditor.org's export will change image file according to exported directory
                String imageName = map.image.substring(map.image.lastIndexOf('/')+1);
                map.image = "/images/tilesets/" + imageName;
                tileSets.put(tileset, map);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }


    @GET
    public Object[] allTileSets() {
        return tileSets.keySet().toArray();
    }

    @GET
    @Path("/{name}")
    public RealTileSet getTileSet(String name) {
        return tileSets.get(name);
    }
}
