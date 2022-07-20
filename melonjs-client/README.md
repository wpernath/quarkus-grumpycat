# quarkus-grumpycat / melonjs client
This is a refactored JavaScript / melonjs client for the game written with Quarkus / JavaScript [here](https://github.com/wpernath/quarkus-grumpycat). NOTE, that in order to run this client, you also need to start the server, as it will be used to 
- download levels
- storing highscores
- creating new games on the server
- storing and reading player movements on the server
- storing and reading enemy movements on the server


## The Game

This game was inspired by the old Fat-Cat game and by PacMan. You're controlling a dog in a maze which needs to eat all food without being caught by a grumpy cat. 

Right now you can control the dog with arrow keys UP, DOWN, LEFT & RIGHT and with W, A, S, D. More keys are:

- *P* PAUSE
- *SPACE* place bomb
- *Shift* + UP/DOWN/LEFT/RIGHT: place barrier in the direction

If the cat gets into an exploding bomb, it is stunned for 3sec. A bomb can also destroy barriers. The level ends if you got all food. 

## NEW 
This engine supports a new enemy type: Spider. Spiders are not coming alone! If a spider gets into an exploding bomb, the spider will be killed. 
  

Game logic is coded with [melonjs JavaScript engine](https://github.com/melonjs/melonjs)

![the game](docs/the-game.png)

## Running the application in dev mode
First of all, you need to also run the [server part](https://github.com/wpernath/quarkus-grumpycat). Then make sure, you open `src/config.js` and change the `CONFIG.environment` variable to `local`. 

You can run your application in dev mode that enables live coding using:
```shell script
npm install
npm run dev
```




## Game Server
You have to install the quarkus part as well to run this application! Please go [there](https://github.com/wpernath/quarkus-grumpycat) and have a look. 


## Game Logic


## Creating new Levels
To create a new level, fork the server part of grumpycat and download the [Tiled MapEditor](https://mapeditor.org). A `Level-Template.tmx` can be found in `/tiled` folder of the server part. 

## Running on Docker / Podman
There are container images ready to be used on [Quay.io](https://quay.io/wpernath/grumpycat-meleonjs). Use this command to pull the image to your local repository:

```shell
docker pull quay.io/wpernath/grumpycat-melonjs
```

Note, to run the server part, you need to have a PostgreSQL database running. You can use the `docker-compose.yaml` file in `src/main/docker/` to setup a local docker / podman compose environment.

```shell
docker-compose -f src/main/docker/docker-compose.yaml [--detach|-d] up
```

The app is then available under `http://localhost:8081` in your browser.


## Running on Kubernetes / OpenShift
### OpenShift S2I
Installing database

```shell
oc new-app postgresql-persistent \
	-p POSTGRESQL_USER=cat \
	-p POSTGRESQL_PASSWORD=grumpy \
	-p POSTGRESQL_DATABASE=catdb \
	-p DATABASE_SERVICE_NAME=catserver
```

Start building the app
```shell
oc new-app java:openjdk-17-ubi8~https://github.com/wpernath/quarkus-grumpycat.git  --name=grumpy-cat --build-env MAVEN_MIRROR_URL=http://nexus.ci:8081/repository/maven-public/
```

Expose the service
```shell
oc expose svc/grumpy-cat
```

### OpenShift / Kubernetes image deployment in a GitOps way
There are precompiled images available on `quay.io/wpernath/quarkus-grumpycat`. You can either use `latest` tag or use one of the `vx.y.z` tags.

NOTE, for this approach, you need to have the `Crunchy Data Postgres Operator` installed in your Kubernetes environment. 

Just clone the [config repository](https://github.com/wpernath/grumpycat-config.git). Then apply the `config/overlays/dev` configuration as usual:

```shell
oc new-project cat-dev
oc apply -k config/overlays/dev
```

This will automatically install a database and the latest DEV version of the App.


### Using full featured GitOps
To make use of all GitOps features, have a look at the `src/main/gitops` folder of this project. 

Your OpenShift / Kubernetes cluster needs to have the following Operators installed:

- OpenShift Pipeline (or Tekton Pipeline)
- OpenShift GitOps (or an ArgoCD instance)
- Crunchy Data Postgres Operator

To install the `cat-ci` project, call:

```shell
./src/main/gitops/tekton/pipeline.sh init \
	--force \
	--git-user <your git user> \
	--git-password <your git password> \
	--registry-user <your quay.io user> \
	--registry-password <your quay.io password>
```

To install the `cat-dev` and `cat-stage` projects, call

```shell
oc apply -k ./src/main/gitops/argocd
```

To start a pipeline build, call

```shell
./src/main/gitops/tekton/pipeline.sh build \
	-u <your quay.io user>
	-p <your quay.io password>
```

To stage your version of quarkus-grumpycat, call something like

```shell
./src/main/gitops/tekton/pipeline.sh stage -r v0.2.4
```

This creates a new branch in github.com and tags the current image on quay.io.

## Roadmap

- In the near future there will also be an EnemyMovementResource to store - well - the enemy's movements, as my plan to calculate new positions of the enemies based on current PlayerMovement doesn't work properly (timing issue).

- Refactoring of the JavaScript stuff. I mainly have used this project to learn some JavaScript. Now it's time to refactor everything and to use some more fancy methods to do the same.

- Do not directly use the Player- / EnemyMovement to store the data in the database, but use Apache Kafka or Streams to take the data and then use a Consumer to store the data asynchronously in the database. 

## About the graphics
The map graphics are coming from [LPC Terrain](https://opengameart.org/content/tiled-terrains) and all its authors. Special thanks to all of them!
                    