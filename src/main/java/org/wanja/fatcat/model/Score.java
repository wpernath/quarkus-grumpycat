package org.wanja.fatcat.model;

import java.util.Date;

import javax.persistence.Entity;
import javax.persistence.OneToOne;

import io.quarkus.hibernate.orm.panache.PanacheEntity;

@Entity
public class Score extends PanacheEntity {
    @OneToOne
    public Player player;
    public long score;
    public Date time = new Date();
}
