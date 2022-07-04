package org.wanja.fatcat.model;

import java.util.Date;

import javax.persistence.Entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;

@Entity
public class Score extends PanacheEntity {    
    public Long playerId;
    public Long gameId;
    public long score;
    public Date time = new Date();
}
