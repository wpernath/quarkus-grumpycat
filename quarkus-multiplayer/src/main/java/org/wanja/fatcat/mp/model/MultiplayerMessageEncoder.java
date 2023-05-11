package org.wanja.fatcat.mp.model;

import jakarta.websocket.EncodeException;
import jakarta.websocket.Encoder;
import jakarta.websocket.EndpointConfig;

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
