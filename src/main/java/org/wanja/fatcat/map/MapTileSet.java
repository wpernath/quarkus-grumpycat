package org.wanja.fatcat.map;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonInclude;

public class MapTileSet  {    
    public String source;

    @JsonProperty("firstgid")
    public Long firstGid;
}
