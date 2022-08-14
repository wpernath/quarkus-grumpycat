package org.wanja.fatcat.model;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import io.quarkus.hibernate.orm.panache.PanacheEntity;

@Entity
@Table(name = "mp_game")
public class MultiPlayerGame extends PanacheEntity {
    public boolean isOpen;
    public boolean isRunning;
    public boolean isClosed;
    public int level; // multiplayer level, eg, level from MapResource.mpLevel(x)
    
    @Column(name = "time_started")
    public Date timeStarted;

    @Column(name = "time_started")
    public Date timeStopped;

    // we only support up to 4 players 
    @ManyToOne
    @JoinColumn(name = "player1_id", insertable = false, updatable = false)
    public MultiPlayer player1;

    @ManyToOne
    @JoinColumn(name = "player2_id", insertable = false, updatable = false)
    public MultiPlayer player2;

    @ManyToOne
    @JoinColumn(name = "player3_id", insertable = false, updatable = false)
    public MultiPlayer player3;

    @ManyToOne
    @JoinColumn(name = "player4_id", insertable = false, updatable = false)
    public MultiPlayer player4;
}
