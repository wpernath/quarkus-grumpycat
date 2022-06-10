package org.wanja.fatcat.model;

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
}
