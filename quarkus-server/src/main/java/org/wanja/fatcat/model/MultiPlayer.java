package org.wanja.fatcat.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import io.quarkus.hibernate.orm.panache.PanacheEntity;

@Entity
@Table(name = "multi_player")
public class MultiPlayer extends PanacheEntity {
    public String name;

    @ManyToOne
    @JoinColumn(name = "player_id", insertable = false, updatable = false)
    public Player player;

    public long score;    

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

    public MultiPlayer() {        
    }

    
    public MultiPlayer(String name) {
        this.name = name;
    }

    public MultiPlayer(Player p) {
        this.name = p.name;
        this.player = p;
    }

    @Override
    public String toString() {
        StringBuilder builder = new StringBuilder();
        builder.append("MultiPlayer [bittenBySpiders=").append(bittenBySpiders).append(", bonusCollected=")
                .append(bonusCollected).append(", catchedByCats=").append(catchedByCats).append(", catchedByGolems=")
                .append(catchedByGolems).append(", killedSpiders=").append(killedSpiders).append(", name=").append(name)
                .append(", placedBarriers=").append(placedBarriers).append(", score=").append(score)
                .append(", stunnedCats=").append(stunnedCats).append(", stunnedGolems=").append(stunnedGolems)
                .append(", usedBombs=").append(usedBombs).append("]");
        return builder.toString();
    }

    
    
}
