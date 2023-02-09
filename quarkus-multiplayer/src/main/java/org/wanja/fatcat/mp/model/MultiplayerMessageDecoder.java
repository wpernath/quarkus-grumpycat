package org.wanja.fatcat.model;

import javax.websocket.DecodeException;
import javax.websocket.Decoder;
import javax.websocket.EndpointConfig;

import com.fasterxml.jackson.databind.ObjectMapper;

public class MultiplayerMessageDecoder implements Decoder.Text<MultiplayerMessage> {

    ObjectMapper om;
    @Override
    public void init(EndpointConfig config) {        
        om = new ObjectMapper();
    }

    @Override
    public void destroy() {
        om = null;
        
    }

    @Override
    public MultiplayerMessage decode(String s) throws DecodeException {        

        try {
            return om.readValue(s, MultiplayerMessage.class);
        } 
        catch (Exception e) {
            e.printStackTrace();
            throw new DecodeException(s, e.getMessage());
        } 
    }

    @Override
    public boolean willDecode(String s) {
        // TODO Auto-generated method stub
        return true;
    }

    
}
