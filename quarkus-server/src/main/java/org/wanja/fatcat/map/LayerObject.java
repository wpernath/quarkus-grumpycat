package org.wanja.fatcat.map;

import java.util.List;
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
    public long gid;
    public boolean visible;
    public double x;
    public double y;
    public int rotation;

    public List<LayerObjectPoint> polyline;
    public Set<LayerProperty> properties;
}
