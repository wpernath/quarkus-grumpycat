package org.wanja.fatcat;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.annotation.PostConstruct;
import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.jboss.resteasy.annotations.jaxrs.PathParam;
import org.wanja.fatcat.map.Map;

@Path("/maps")
public class MapResource {
    
    List<Map> maps = new ArrayList<>();

    @Inject
    ObjectMapper mapper;


    @PostConstruct
    void init() {
        
        // add new levels here! All levels are stored in /java/resources/maps
        String[] levels = new String[] {
            "Level1.tmj",
            "Level2.tmj",
            "Level3.tmj",
            "Level4.tmj"
        };

        try {
            for(String level : levels ) {
                Map map = mapper.readValue(
                        getClass().getResourceAsStream("/maps/" + level ), 
                        Map.class);

                // Hack to make sure, tileset is properly loaded as
                // MapEditor.org's export will change image file according to exported directory
                if( map.tilesets != null && !map.tilesets.isEmpty()) {
                    map.tilesets.forEach( t -> t.image = "/images/tilesets/terrain.png" );                    
                }
                maps.add(map);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @GET
    @Path("/{level}")
    public Map mapByLevel(@PathParam int level) {
        return maps.get(level);
    }

    @GET
    @Path("/")
    public int numLevels() {
        return maps.size();
    }
}
