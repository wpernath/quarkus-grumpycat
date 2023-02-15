package org.wanja.fatcat.client;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

import javax.annotation.PostConstruct;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;

import org.eclipse.microprofile.config.inject.ConfigProperty;

import io.quarkus.logging.Log;


@Path("/")
@Produces("text/html")
public class ClientRenderResource {
    @ConfigProperty(name = "application.baseServerURL")
    String baseURL;

    @ConfigProperty(name = "application.baseMultiplayerServerURL")
    String baseMPURL;
    
    @ConfigProperty(name = "quarkus.application.name")
    String appName;

    @ConfigProperty(name = "application.version")
    String appVersion;

    String rewrittenBundle;

    String rewrittenIndex;

    @PostConstruct
    void init() throws IOException {
        InputStream is = getClass().getResourceAsStream("/META-INF/resources/generated/grumpycat.bundle.js");
        InputStreamReader isr = new InputStreamReader(is);
        StringBuilder sb = new StringBuilder();
        BufferedReader br = new BufferedReader(isr);
        String line;
        while ((line = br.readLine()) != null) {
            sb.append(line).append("\n");
        }
        br.close();

        line = sb.toString();
        this.rewrittenBundle = line.replaceAll("\\{\\{baseURL\\}\\}", baseURL)
                .replaceAll("\\{\\{baseMPURL\\}\\}", baseMPURL)
                .replaceAll("\\{\\{applicationName\\}\\}", appName)
                .replaceAll("\\{\\{applicationVersion\\}\\}", appVersion);

        // read index.html
        is = getClass().getResourceAsStream("/META-INF/resources/generated/index.html");
        isr = new InputStreamReader(is);
        sb = new StringBuilder();
        br = new BufferedReader(isr);
        while ((line = br.readLine()) != null) {
            sb.append(line).append("\n");
        }
        br.close();

        line = sb.toString();
        this.rewrittenIndex = line.replaceAll("src=\"grumpycat.bundle.js", "src=\"cat-client.js" )
                    .replaceAll("\\{\\{applicationName\\}\\}", appName)
                    .replaceAll("\\{\\{applicationVersion\\}\\}", appVersion);


    }

    @GET
    @Path("/generated/cat-client.js")
    public String renderBundle() throws IOException {
        Log.info("returning bundle.js");
        return rewrittenBundle;
    }

    @GET
    @Path("/generated/index")
    public String renderIndex() {
        Log.info("return index.html");
        return rewrittenIndex;
    }
}
