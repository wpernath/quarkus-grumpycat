package org.wanja.fatcat;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;

import net.datafaker.Faker;

@Path("/faker")
public class FakeNameResource {
    
    @GET
    public String fakeName() {
        Faker f = new Faker();
        return f.ancient().hero() + " " + f.cat().name();
    }
}
