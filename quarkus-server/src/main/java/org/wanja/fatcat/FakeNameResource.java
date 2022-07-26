package org.wanja.fatcat;

import javax.ws.rs.GET;
import javax.ws.rs.Path;

import com.github.javafaker.Faker;

@Path("/faker")
public class FakeNameResource {
    
    @GET
    public String fakeName() {
        Faker f = Faker.instance();
        return f.ancient().hero() + " " + f.cat().name();
    }
}
