package org.wanja.fatcat.model;

import java.util.Date;

import javax.persistence.Entity;


import io.quarkus.hibernate.orm.panache.PanacheEntity;

@Entity
public class PlayerAction extends PanacheEntity {

    public long playerId;
    public long gameId;
    public int dx;
    public int dy;
    public int x;
    public int y;
    public boolean bombPlaced=false;
    public boolean gutterThrown=false;
    public boolean gameOver = false;
    public boolean gameWon = false;
    public long score = 0;
    public Date time = new Date();

}
