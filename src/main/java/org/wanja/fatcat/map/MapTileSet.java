package org.wanja.fatcat.map;

import com.fasterxml.jackson.annotation.JsonProperty;

public class MapTileSet  {
    public String source;

    @JsonProperty("firstgid")
    public Long firstGid;
}
