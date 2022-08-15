package org.wanja.fatcat.model;

import javax.websocket.DecodeException;
import javax.websocket.Decoder;
import javax.websocket.EndpointConfig;

public class MultiplayerMessageDecoder implements Decoder.Text<MultiplayerMessage> {

    @Override
    public void init(EndpointConfig config) {
        // TODO Auto-generated method stub
        
    }

    @Override
    public void destroy() {
        // TODO Auto-generated method stub
        
    }

    @Override
    public MultiplayerMessage decode(String s) throws DecodeException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public boolean willDecode(String s) {
        // TODO Auto-generated method stub
        return false;
    }

    
}
