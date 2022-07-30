package org.wanja.fatcat.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
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

    public String name;
    public String type;
    public int x;
    public int y;
    public int dx;
    public int dy;


}
