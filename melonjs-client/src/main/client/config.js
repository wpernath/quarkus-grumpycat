const CONFIG = {
	environment: "prod", // change this TO PROD on deployment

	appName: "{{applicationName}}",
	appVersion: "{{applicationVersion}}",

	baseURL: "",

	local: {
		//baseURL: "http://172.20.10.2:8080/",
		baseURL: "http://localhost:8080/",
		//baseURL: "http://192.168.2.171:8080/",
		//baseURL: "http://192.168.2.198:8080/",
	},

	dev: {
		baseURL: "http://cat-server-cat-dev.apps.work.ocp.lan/",
	},
	test: {
		baseURL: "http://cat-server-cat-stage.apps.work.ocp.lan/",
	},

	// use this one for the quarkus engine on production systems
	// {{baseURL}} will be replaced with the corresponding
	// ENVIRONMENT parameter, provided via ConfigMap
	prod: {
		baseURL: "{{baseURL}}",
	},
};

export default CONFIG;
