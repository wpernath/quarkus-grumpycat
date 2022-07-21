# quarkus-grumpycat / melonjs client
This is a refactored JavaScript / melonjs client for the game written with Quarkus / JavaScript. NOTE, that in order to run this client, you also need to start the server, as it will be used to 
- download levels
- storing highscores
- creating new games on the server
- storing and reading player movements on the server
- storing and reading enemy movements on the server

## Start in local dev mode
```shell script
npm install
npm run dev
```
Your client is then available under https://localhost:9000/

NOTE, as the client is a pure browser based JavaScript client without any runtime server, you have to manually specify the location of the server. Before running `npm run dev`, you have to make sure, your `src/config.js` environment variable points to the right environment!

```javascript
const CONFIG = {
	environment: "local", // change this TO PROD on deployment

	appName: "{{applicationName}}",
	appVersion: "{{applicationVersion}}",

	baseURL: "",

	local: {
		baseURL: "http://localhost:8080/",
	},

	dev: {
		baseURL: "http://grumpycat-cat-dev.apps.work.ocp.lan/",
	},
	test: {
		baseURL: "http://grumpycat-cat-stage.apps.work.ocp.lan/",
	},

	// use this one for the quarkus engine on production systems
	// {{baseURL}} will be replaced with the corresponding
	// ENVIRONMENT parameter, provided via ConfigMap
	prod: {
		baseURL: "{{baseURL}}",
	},
};
```


## Build a package / container image
The runtime image is using quarkus as underlying webserver. This is to also provide proper environment handling. So, before you're able to build a container image, you HAVE to check the following files:
- `src/config.js` -> Config.environment must be set to `PROD`!
- `src/main/resources/application.properties` and change the container image property to use YOUR repository. 
  
Then execute:

```shell script
mvn clean package -Dquarkus.container-image-push=true
```

This will also execute `npm run build` by using the `frontend-maven-plugin`. Generated javascript will be stored into src/main/resources/META-INF/generated in order for Quarkus to find all the files!



## About the graphics
The map graphics are coming from [LPC Terrain](https://opengameart.org/content/tiled-terrains) and all its authors. Special thanks to all of them!
                