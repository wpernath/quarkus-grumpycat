package org.wanja.fatcat.model;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

import io.quarkus.hibernate.orm.panache.PanacheEntity;

@Entity
public class Game extends PanacheEntity {
    @ManyToOne
    @JoinColumn(name="player_id", insertable=false, updatable = false)
    public Player player;

    @Column(name = "player_id")
    public Long playerId;

    public Date time = new Date();
    public String name;
    public int level;
}
