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
    @Column(name = "is_open")
    public boolean isOpen;

    @Column(name = "is_running")
    public boolean isRunning;

    @Column(name = "is_closed")
    public boolean isClosed;

    @Column(name = "is_finished")
    public boolean isFinished;

    public int level; // multiplayer level, eg, level from MapResource.mpLevel(x)
    
    @Column(name = "time_started")
    public Date timeStarted;

    @Column(name = "time_stopped")
    public Date timeStopped;

    @Column(name = "time_playing")
    public Date timePlaying;

    @Column(name="time_finished")
    public Date timeFinished;


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

    @Column(name ="player1_id")
    public Long player1Id;

    @Column(name = "player2_id")
    public Long player2Id;

    @Column(name = "player3_id")
    public Long player3Id;

    @Column(name = "player4_id")
    public Long player4Id;

}
