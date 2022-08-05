package org.wanja.fatcat.model;

import java.util.HashSet;
import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import io.quarkus.hibernate.orm.panache.PanacheEntity;

@Entity
@Table(name = "player_action")
public class PlayerAction extends PanacheEntity {

    @Column(name = "player_id")
    public Long playerId;

    @Column(name = "game_id")
    public Long gameId;
    public int dx;
    public int dy;
    public int x;
    public int y;

    @Column(name = "bomb_placed")
    public boolean bombPlaced=false;

    @Column(name = "gutter_thrown")
    public boolean gutterThrown=false;

    @Column(name = "game_over")
    public boolean gameOver = false;

    @Column(name = "game_won")
    public boolean gameWon = false;
    public long score = 0;
    public long time = System.currentTimeMillis();

    //@OneToMany
    //@JoinColumn(name ="player_action_id")
    //public Set<EnemyAction> enemies = new HashSet<>();
}
