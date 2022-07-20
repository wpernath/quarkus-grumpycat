package org.wanja.fatcat;

import java.util.Date;
import java.util.List;

import javax.transaction.Transactional;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;

import org.wanja.fatcat.model.Score;

@Path("/highscore")
public class HighScoreResource {
    
    @GET
    @Path("/{highestX}")
    public List<Score> readHighscore(int highestX) {
        List<Score> list = Score.list("order by score desc, time");
        if( highestX > 0 && list.size() > highestX) {
            list = list.subList(0, highestX);
        }
        return list;
    }

    @POST
    @Transactional
    public List<Score> addScore(Score score) {
        score.id = null;
        if( score.time == null ) score.time = new Date();        
        score.persist();
        return readHighscore(10);
    }

    @DELETE
    @Transactional
    @Path("/{id}")
    public List<Score> deleteScore(Long id) {
        Score.deleteById(id);
        return readHighscore(10);
    }
}
