package org.wanja.fatcat;

import javax.ws.rs.GET;
import javax.ws.rs.Path;

import net.datafaker.Faker;

@Path("/faker")
public class FakeNameResource {
    
    @GET
    public String fakeName() {
        Faker f = new Faker();
        return f.ancient().hero() + " " + f.cat().name();
    }
}
