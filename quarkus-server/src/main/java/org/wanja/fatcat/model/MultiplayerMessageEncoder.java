package org.wanja.fatcat.model;

import javax.websocket.EncodeException;
import javax.websocket.Encoder;
import javax.websocket.EndpointConfig;

public class MultiplayerMessageEncoder implements Encoder.Text<MultiplayerMessage> {

    @Override
    public void init(EndpointConfig config) {
        // TODO Auto-generated method stub
        
    }

    @Override
    public void destroy() {
        // TODO Auto-generated method stub
        
    }

    @Override
    public String encode(MultiplayerMessage object) throws EncodeException {
        // TODO Auto-generated method stub
        return null;
    }

    
}
