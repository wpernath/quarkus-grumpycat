package org.wanja.fatcat.map;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class RealTileSet extends MapTileSet {
    public String name;
    public String image;
    
    @JsonProperty("tiledversion")
    public String tiledVersion;

    @JsonProperty("imagewidth")
    public int imageWidth;

    @JsonProperty("imageheight")
    public int imageHeight;
    public int columns;
    public int margin;
    public int spacing;

    @JsonProperty("tilecount")
    public int tileCount;

    @JsonProperty("tileheight")
    public int tileHeight;

    @JsonProperty("tilewidth")
    public int tileWidth;

    public List<Tile> tiles;
}
