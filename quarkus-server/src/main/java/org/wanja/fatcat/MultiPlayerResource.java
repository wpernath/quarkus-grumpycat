package org.wanja.fatcat;

import javax.transaction.Transactional;
import javax.ws.rs.Path;

import org.wanja.fatcat.model.MultiPlayer;
import org.wanja.fatcat.model.MultiPlayerGame;

@Path("/mp-game")
public class MultiPlayerResource {

    @Transactional
    public MultiPlayerGame createGame(MultiPlayer host) {
        MultiPlayerGame game = new MultiPlayerGame();
        game.player1 = host;
        return game;
    }

    @Transactional
    public void joinGame(MultiPlayerGame game ) {
        game.persist();
    }
}
