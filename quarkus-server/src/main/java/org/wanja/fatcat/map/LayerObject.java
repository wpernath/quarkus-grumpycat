package org.wanja.fatcat.map;

import java.util.Set;

import com.fasterxml.jackson.annotation.JsonProperty;

public class LayerObject {
    public Long id;

    @JsonProperty("class")
    public String clazz;
    public String name;
    public boolean point;
    public int width;
    public int height;
    public boolean visible;
    public float x;
    public float y;

    public Set<LayerProperty> properties;
}
