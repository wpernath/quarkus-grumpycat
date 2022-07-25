# Kubernetes Configuration files
This folder is a quick copy of the [grumpycat-config](https://github.com/wpernath/grumpycat-config) repository. It's here to make things easier for you to consume the app on OpenShift.

## Installation
Simply create a new project in OpenShift by executing:

```shell script
oc new-project grumpy-test
```

And then execute:

```shell script
oc apply -k kubernetes-config/overlays/dev
```

This will install the latest grumpycat client, server and other dependencies in the current active project. You can delete the installation by executing

```shell script
oc delete -k kubernetes-config/overlays/dev
```

**NOTE**, if you want to install the app in any other namespace than `grumpy-test`, you have to change `APPLICATION_BASESERVERURL` in `overlays/dev/kustomization.yaml` to point to the corresponding URL:

Instead of:

```
# generate a configmap 
configMapGenerator:
  # Cat - Client ConfigMap, note that the client app runs entirely on the browser, 
  # so we need to use the external URL of the grumpycat server service
  # 
  - name: client-config
    literals:
      - APPLICATION_BASESERVERURL=http://cat-server-grumpy-test.apps.work.ocp.lan/  
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
      - APPLICATION_BASESERVERURL=http://cat-server-<my namespace>.apps.work.ocp.lan/  
```


