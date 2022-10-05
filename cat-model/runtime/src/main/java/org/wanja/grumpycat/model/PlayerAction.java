package org.wanja.grumpycat.model;


import javax.persistence.Column;
import javax.persistence.Entity;
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

    
    @Override
    public String toString() {
        StringBuilder builder = new StringBuilder();
        builder.append("PlayerAction [bombPlaced=").append(bombPlaced).append(", dx=").append(dx).append(", dy=")
                .append(dy).append(", gameId=").append(gameId).append(", gameOver=").append(gameOver)
                .append(", gameWon=").append(gameWon).append(", gutterThrown=").append(gutterThrown)
                .append(", playerId=").append(playerId).append(", score=").append(score).append(", time=").append(time)
                .append(", x=").append(x).append(", y=").append(y).append("]");
        return builder.toString();
    }

    //@OneToMany
    //@JoinColumn(name ="player_action_id")
    //public Set<EnemyAction> enemies = new HashSet<>();


}
