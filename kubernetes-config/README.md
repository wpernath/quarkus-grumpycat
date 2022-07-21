# Kubernetes Configuration files
This folder is a quick copy of the [grumpycat-config](https://github.com/wpernath/grumpycat-config) repository. It's here to make things easier for you to consume the app on OpenShift.

## Installation
Simply create a new project in OpenShift by executing:

```shell script
oc new-project my-new-project
```

And then execute:

```shell script
oc apply -k kubernetes-config
```

This will install the latest grumpycat client, server and other dependencies in the current active project.

