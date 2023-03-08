package org.wanja.fatcat.mp.model;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import org.infinispan.protostream.annotations.ProtoFactory;
import org.infinispan.protostream.annotations.ProtoField;
import org.wanja.fatcat.model.MultiPlayer;

import io.quarkus.hibernate.orm.panache.PanacheEntity;


@Entity
@Table(name = "mp_game")
public class MultiPlayerGame extends PanacheEntity {

    @ProtoField(number = 1, defaultValue = "false")
    @Column(name = "is_open")
    public boolean isOpen;

    @ProtoField(number = 2, defaultValue = "false")
    @Column(name = "is_running")
    public boolean isRunning;

    @ProtoField(number = 3, defaultValue = "false")
    @Column(name = "is_closed")
    public boolean isClosed;

    @ProtoField(number = 4, defaultValue = "false")
    @Column(name = "is_finished")
    public boolean isFinished;

    @ProtoField(number = 5, defaultValue = "0")
    public int level; // multiplayer level, eg, level from MapResource.mpLevel(x)
    
    @ProtoField(number = 6)
    @Column(name = "time_started")
    public Date timeStarted;

    @ProtoField(number = 7)
    @Column(name = "time_stopped")
    public Date timeStopped;

    @ProtoField(number = 8)
    @Column(name = "time_playing")
    public Date timePlaying;

    @ProtoField(number = 9)
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

    @ProtoField(number = 10)
    @Column(name ="player1_id")
    public Long player1Id;

    @ProtoField(number = 11)
    @Column(name = "player2_id")
    public Long player2Id;

    @ProtoField(number = 12)
    @Column(name = "player3_id")
    public Long player3Id;

    @ProtoField(number = 13)
    @Column(name = "player4_id")
    public Long player4Id;


}
