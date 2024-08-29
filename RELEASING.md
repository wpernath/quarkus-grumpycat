# Creating a release
The following steps need to be done in order to create a new release:

- melonjs-client/src/main/client/config.js : Make sure, `environment` is set to PROD.
- open all 3 pom.xml files and change the version according to your release
- open `./docker-compose.yaml` and make sure cat-client and cat-server are pointing to the image with the corresponding tag
- open `./kubernetes-config/overlays/<dev|your overlay>/kustomization.yaml` and make sure the image tag is being used accordingly
- in CLI, call `mvn clean package -Dquarkus.container-image.push=true` from root dir. This will create tagged images of client and server
- create a git tag: `git tag -am 'Releasing xyz' v0.6.x
- DONE
