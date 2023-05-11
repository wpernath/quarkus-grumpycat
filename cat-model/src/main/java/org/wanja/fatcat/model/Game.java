package org.wanja.fatcat.model;

import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

import io.quarkus.hibernate.orm.panache.PanacheEntity;

@Entity
public class Game extends PanacheEntity {
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="player_id", insertable=false, updatable = false )
    public Player player;

    @Column(name = "player_id")
    public Long playerId;

    public Date time = new Date();
    public String name;
    public int level;


    @Override
    public String toString() {
        StringBuilder builder = new StringBuilder();
        builder.append("Game [id=").append(id)
                .append(", level=").append(level).append(", name=").append(name).append(", player=").append(player.toString())
                .append(", playerId=").append(playerId).append(", time=").append(time).append("]");
        return builder.toString();
    }

    
}
