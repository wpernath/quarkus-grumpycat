package org.wanja.fatcat.model;

import java.util.HashSet;
import java.util.Set;

import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.OneToMany;

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
