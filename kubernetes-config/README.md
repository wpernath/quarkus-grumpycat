# Kubernetes Configuration files
This folder is a quick copy of the [grumpycat-config](https://github.com/wpernath/grumpycat-config) repository. It's here to make things easier for you to consume the app on OpenShift.

## Installation
Simply log into your OpenShift cluster and then execute

```shell script
oc apply -k kubernetes-config/overlays/<your stage|dev>
```

This will create a namespace called `grumpycat` and installs the latest grumpycat client, server and other dependencies in the namespace. You can delete the installation by executing

```shell script
oc delete -k kubernetes-config/overlays/<your stage|dev>
```

**NOTE**, if you want to install the app in any other namespace than `grumpycat`, you have to change the following files and properties in there:
- `base/ns.yaml` change the name of the namespace to be created
- `overlays/<your-target>/kustomization.yaml`
  - Change `namespace` entry to your namespace
  - Change `APPLICATION_BASESERVERURL` to point to the corresponding URL:

Instead of:

```
# generate a configmap 
configMapGenerator:
  # Cat - Client ConfigMap, note that the client app runs entirely on the browser, 
  # so we need to use the external URL of the grumpycat server service
  # 
  - name: client-config
    literals:
      - APPLICATION_BASESERVERURL=http://cat-server-grumpycat.apps.work.ocp.lan/  
```

You should have something like:

```
# generate a configmap 
configMapGenerator:
  # Cat - Client ConfigMap, note that the client app runs entirely on the browser, 
  # so we need to use the external URL of the grumpycat server service
  # 
  - name: client-config
    literals:
      - APPLICATION_BASESERVERURL=http://cat-server-<my namespace>.apps.<my-domain>/  
```


