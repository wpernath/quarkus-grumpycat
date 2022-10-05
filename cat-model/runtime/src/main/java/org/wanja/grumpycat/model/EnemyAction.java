package org.wanja.grumpycat.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

import io.quarkus.hibernate.orm.panache.PanacheEntity;

@Entity
@Table(name = "enemy_action")
public class EnemyAction extends PanacheEntity{    

    //@ManyToOne
    //@JoinColumn(name = "player_action_id", nullable = false, insertable = false, updatable = false)
    //public PlayerAction action;

    @Column(name = "player_action_id")
    public Long playerActionId;

    @Column(name="player_id")
    public Long playerId;

    @Column(name = "game_id")
    public Long gameId;

    public String name;
    public String type;
    public int x;
    public int y;
    public int dx;
    public int dy;
    public boolean isStunned = false;
    public boolean isDead = false;
    public Long time;
    
    public EnemyAction() {}

    @Override
    public String toString() {
        StringBuilder builder = new StringBuilder();
        builder.append("EnemyAction [dx=").append(dx).append(", dy=").append(dy).append(", gameId=").append(gameId)
                .append(", isDead=").append(isDead).append(", isStunned=").append(isStunned).append(", name=")
                .append(name).append(", playerActionId=").append(playerActionId).append(", playerId=").append(playerId)
                .append(", type=").append(type).append(", x=").append(x).append(", y=").append(y).append("]");
        return builder.toString();
    }

    
}
