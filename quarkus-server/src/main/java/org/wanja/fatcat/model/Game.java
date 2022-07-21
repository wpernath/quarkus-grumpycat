package org.wanja.fatcat.model;

import java.util.Date;

import javax.persistence.Entity;
import javax.persistence.OneToOne;

import io.quarkus.hibernate.orm.panache.PanacheEntity;

@Entity
public class Game extends PanacheEntity {
    @OneToOne
    public Player player;
    public Date time = new Date();
    public String name;
    public int level;
}
