package org.wanja.fatcat.map;

import java.util.List;

public class Layer {
    public int id;
    public int height;
    public int width;
    public String name;
    public int opacity;
    public String type;
    public int x;
    public int y;
    public boolean visible;
    public long[] data;
    public List<LayerProperty> properties;
    public List<LayerObject> objects;
}
