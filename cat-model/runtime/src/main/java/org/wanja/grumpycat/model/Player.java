package org.wanja.grumpycat.model;

import javax.persistence.Entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;

@Entity
public class Player extends PanacheEntity {
    public String name;

    public Player() {        
    }

    
    public Player(String name) {
        this.name = name;
    }


    @Override
    public String toString() {
        StringBuilder builder = new StringBuilder();
        builder.append("Player [id=").append(id).append(", name=").append(name).append("]");
        return builder.toString();
    }

    
}
