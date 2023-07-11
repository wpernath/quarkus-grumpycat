package org.wanja.fatcat.mp;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;

import org.eclipse.microprofile.config.inject.ConfigProperty;

@Path("/")
public class VersionService {
    @ConfigProperty(name = "application.version")
    String versionString;

    @ConfigProperty(name = "quarkus.application.name")
    String appName;

    @GET
    @Path("/version")
    public AppVersion version() {
        return new AppVersion("multiplayer-server", this.appName, this.versionString);
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
