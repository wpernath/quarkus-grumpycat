package org.wanja.fatcat;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.annotation.PostConstruct;
import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.wanja.fatcat.map.Layer;
import org.wanja.fatcat.map.LayerProperty;
import org.wanja.fatcat.map.Map;
import org.wanja.fatcat.map.MapTileSet;
import org.wanja.fatcat.map.RealTileSet;


@Path("/maps")
public class MapResource {
    
    List<Map> maps = new ArrayList<>();

    @Inject
    ObjectMapper mapper;

    @Inject
    TileSetResource tileSetResource;

    @PostConstruct
    void init() {
        
        // add new levels here! All levels are stored in /java/resources/maps
        String[] levels = new String[] {
            "Level1.tmj",
            "Level2.tmj",
            "Level5.tmj",
            "Level4.tmj",
            "Level3.tmj",
        };

        try {
            for(String level : levels ) {
                Map map = mapper.readValue(
                        getClass().getResourceAsStream("/maps/" + level ), 
                        Map.class);
                maps.add(map);   

                // make sure person layer is not visible
                List<Layer> layers = map.layers;
                layers.forEach(l -> {
                    if( l.name.equalsIgnoreCase("Persons")) {
                        l.visible = false;
                    }
                });
                
                // look for a map property named 'name' and make it 'longName'
                if( map.properties != null && map.properties.size() > 0 ) {
                    for( LayerProperty p : map.properties ) {
                        if( p.name.equalsIgnoreCase("Name")) {
                            map.longName = p.value;
                        }
                        else if( p.name.equalsIgnoreCase("Description")) {
                            map.description = p.value;
                        }
                    }
                }

                // resolve all tilesets of the map
                List<MapTileSet> sets = map.tilesets;
                map.tilesets = new ArrayList<MapTileSet>();

                // resolve all tilesets of the map
                sets.forEach(t -> {
                    MapTileSet mts = (MapTileSet )t;
                    mts.source = mts.source.substring(mts.source.lastIndexOf('/')+1, mts.source.lastIndexOf('.') );
                    
                    RealTileSet rts = tileSetResource.getTileSet(mts.source);
                    rts.firstGid = mts.firstGid;
                    map.tilesets.add(rts);
                });
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @GET
    @Path("/{level}")
    public Map mapByLevelId(int level) {
        return mapByLevel(level);
    }

    @GET
    @Path("/{level}.json")    
    public Map mapByLevel(int level) {
        if( level >= 0 && level < maps.size()) {
            return maps.get(level);
        }
        return null;
    }

    @GET
    @Path("/")
    public int numLevels() {
        return maps.size();
    }
}
