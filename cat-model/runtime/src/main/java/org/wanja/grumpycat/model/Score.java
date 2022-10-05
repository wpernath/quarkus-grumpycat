package org.wanja.grumpycat.model;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;

@Entity
public class Score extends PanacheEntity {    
    @Column(name = "player_id")
    public Long playerId;

    @Column(name = "game_id")
    public Long gameId;
    public long score;
    public int level;

    @Column(name = "placed_barriers")
    public int placedBarriers;

    @Column(name = "used_bombs")
    public int usedBombs;

    @Column(name = "bitten_by_spiders")
    public int bittenBySpiders;

    @Column(name = "catched_by_cats")
    public int catchedByCats;

    @Column(name = "catched_by_golems")
    public int catchedByGolems;

    @Column(name = "killed_spiders")
    public int killedSpiders;

    @Column(name = "stunned_cats")
    public int stunnedCats;

    @Column(name = "stunned_golems")
    public int stunnedGolems;

    @Column(name = "bonus_collected")
    public int bonusCollected;

    public String name;
    public Date time = new Date();
}
