# Contributor's guide
Thank you so much for your interest in contributing to this game. There are several areas which requires contributions:
- Game graphics (an animated player sprite would be awesome)
- Game sounds and sfx (there are none so far)
- New / updated levels (see the [tiled](./tiled/README.md) folder for instructions)
- JavaScript client codings for several areas, features
- Java server codings 

If you want to contribute to this game, please feel free so by first of all fork this repository, set up your required local dev stack and then create a branch where you are coding against. Then create a pull request against the "main" branch of this repository. 

## Setting up your local environment
### Compiling & Running server
You need a current version of the [Java SDK](https://adoptium.net/). And you also need to have a current version of [Apache Maven](https://maven.apache.org). 

Then you need to startup the server by getting into `quarkus-server` and executing:
```shell script
cd quarkus-server
./mvnw compile quarkus:dev
```

### Compiling & Running client
For the client you need to have latest [NodeJS](https://nodejs.org) installed. 
Then you need to open another terminal window and need to get into the client and executing:
```shell script
cd melonjs-client
npm install
npm run dev
```

Make sure that the `environment` variable in `melonjs-client/src/config.js` is set to `local`. 


## Overall architecture of this game
The following diagram shows you the overall 100000 feet architecture of this game. 
![Architecture](./docs/architecture.png)

### The cat-client
The client is 100% a browser based JavaScript application, based on the MelonJS [es6-boilerplate](https://github.com/melonjs/es6-boilerplate) code. [MelonJS](https://github.com/melonjs/melonJS) is a very lightweight gaming framework written in JavaScript. I have chosen this framework, after I have played with pure JavaScript and HTML5 / canvas APIs. I just decided that I do NOT have to do everything myself. 

The client is using [WebPack](https://webpack.js.org/) for final packaging and [Babel](https://babeljs.io/) for some polyfills. The client requires a recent browser (Chrome, Safari and Firefox 100++). 

As I am more a Quarkus / Java guy, I have decided to use a Quarkus runtime for the client. The benefits here are:
- I can easily create container images 
- I have a nice runtime (Vert.x) and do not have to worry about creating a container image with an Apache runtime to serve the content

### The cat-server
The server is 100% Java with a [Quarkus](https://quarkus.io/) backend. 
