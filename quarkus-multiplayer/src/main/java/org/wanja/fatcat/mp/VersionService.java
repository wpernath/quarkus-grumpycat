package org.wanja.fatcat.mp;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;

import org.eclipse.microprofile.config.inject.ConfigProperty;

@Path("/")
public class VersionService {
    @ConfigProperty(name = "application.version")
    String versionString;

    @ConfigProperty(name = "quarkus.application.name")
    String appName;

    @GET
    @Path("/version")
    // @Produces("text/plain")
    public AppVersion version() {
        return new AppVersion("grumpycat-server", this.appName, this.versionString);
    }

    final class AppVersion {
        public String appName;
        public String internalName;
        public String appVersion;

        public AppVersion() {
        }

        public AppVersion(String n, String i, String v) {
            this.appName = n;
            this.appVersion = v;
            this.internalName = i;
        }
    }

}
