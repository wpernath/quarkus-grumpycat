# quarkus-server
This is the server part of the game. It is based on Quarkus and acts as - well - the logic server of the whole game. 

## Start in Dev mode
Quarkus provides a dev mode which we could use to automatically (and magically) install everything you need in order to run it. Please be aware that you need to have Docker / Podman installed.

```shell script
mvn quarkus:dev
```

## Building a package / container image
Make sure you open `src/main/resources/application.properties` and change the container image property to use YOUR repository. Then execute:

```shell script
mvn clean package -Dquarkus.container-image-push=true
```

## Developing
