package org.wanja.fatcat.mp.model;

import javax.websocket.EncodeException;
import javax.websocket.Encoder;
import javax.websocket.EndpointConfig;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.wanja.fatcat.model.MultiplayerMessage;

public class MultiplayerMessageEncoder implements Encoder.Text<MultiplayerMessage> {
    ObjectMapper om;
    
    @Override
    public void init(EndpointConfig config) {
        this.om = new ObjectMapper();
        
    }

    @Override
    public void destroy() {
        this.om = null;
        
    }

    @Override
    public String encode(MultiplayerMessage object) throws EncodeException {
        try {
            return om.writeValueAsString(object);
        } 
        catch (JsonProcessingException e) {
            e.printStackTrace();
            throw new EncodeException(object, e.getMessage());
        }
    }

    
}
