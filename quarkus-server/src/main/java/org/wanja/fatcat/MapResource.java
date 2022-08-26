package org.wanja.fatcat;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.annotation.PostConstruct;
import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;

import com.fasterxml.jackson.databind.ObjectMapper;

import io.quarkus.logging.Log;

import org.wanja.fatcat.map.Layer;
import org.wanja.fatcat.map.LayerObject;
import org.wanja.fatcat.map.LayerProperty;
import org.wanja.fatcat.map.Map;
import org.wanja.fatcat.map.MapTileSet;
import org.wanja.fatcat.map.RealTileSet;


@Path("/maps")
public class MapResource {
    
    List<Map> maps = new ArrayList<>();
    List<Map> multiplayerMaps = new ArrayList<>();

    @Inject
    ObjectMapper mapper;

    @Inject
    TileSetResource tileSetResource;

    @PostConstruct
    void init() {
        
        // add new levels here! All levels are stored in /java/resources/maps
        String[] levels = new String[] {
            "JustCats.tmj",
            "Spiders.tmj",
            "Golems.tmj",
            "CatsSpiders.tmj",
            "TheOcean.tmj",
            "FireAndDragons.tmj", 

            // multiplayer maps
            "mp_arena.tmj",
            "mp_golems.tmj",
        };

        try {
            for(String level : levels ) {
                Map map = mapper.readValue(
                        getClass().getResourceAsStream("/maps/" + level ), 
                        Map.class);
                  
                // Make filename the name of the level without extension
                map.name = level.substring(0, level.lastIndexOf('.'));

                // make sure person layer is not visible
                List<Layer> layers = map.layers;
                layers.forEach(l -> {
                    if( l.name.equalsIgnoreCase("Persons")) {
                        l.visible = false;
                    }
                    else if( l.type.equalsIgnoreCase("objectgroup")) {
                        // make sure any objectgroup layer is not shown && no LayerObject neither
                        l.visible = false;
 

                        for( LayerObject lo : l.objects ) {
                            lo.visible = false;
                            if( lo.point ) {
                                lo.name = "WayPoint";
                            }
                            else {
                                // rename simple polyline objects to WayPath
                                if( lo.polyline != null && !lo.polyline.isEmpty()) {
                                    lo.name = "WayPath";   
                                }
                            }
                        }
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
                        else if( p.name.equalsIgnoreCase("forMultiPlayer")) {
                            map.forMultiplayer = true;
                        }
                        else if( p.name.equalsIgnoreCase("numPlayers")) {
                            map.numPlayers = Integer.parseInt(p.value);
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

                if( map.forMultiplayer ) {
                    multiplayerMaps.add(map);
                }
                else {
                    maps.add(map);
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @GET
    @Path("/{level}")
    public Map mapByLevelId(int level) {
        if( level >= 0 && level < maps.size()) {
            Log.info("Requesting Level #" + (level+1));
            return mapByLevel(level);
        }
        return null;
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

    @GET
    @Path("/mp/{level}")
    public Map mpmapByLevelId(int level) {
        if (level >= 0 && level < multiplayerMaps.size()) {
            Log.info("Requesting Level #" + (level + 1));
            return mpmapByLevel(level);
        }
        return null;
    }

    @GET
    @Path("/mp/{level}.json")
    public Map mpmapByLevel(int level) {
        if (level >= 0 && level < multiplayerMaps.size()) {
            return multiplayerMaps.get(level);
        }
        return null;
    }

    @GET
    @Path("/mp/")
    public int mpnumLevels() {
        return multiplayerMaps.size();
    }

}
