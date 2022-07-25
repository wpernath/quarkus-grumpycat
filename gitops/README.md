# Getting GitOps. 
## GitOps sample

This is the sample discussed in chapter 5. It's about using Tekton and ArgoCD. 

You have to do the following two steps in order to setup the environment. 

## 1. Setup Tekton Pipelines (the CI part)
In order to initialize the Tekton pipelines, call

```bash
$ ./pipeline.sh init --force --git-user <user> \
	--git-password <pwd> \
	--registry-user <user> \
	--registry-password <pwd> 
```

This call (if given the `--force` flag) will create the following namespaces and ArgoCD applications for you:
- `cat-ci`: Pipelines, Tasks and a Nexus instance 

## 2. Setup ArgoCD Applications (the CD part)

To initialize the ArgoCD part, call the following

```bash
$ oc apply -k gitops/argocd
```

This will create two namespaces with all roles properly setup so that Argo CD can then start initializing the environment. It will take a while until you're able to see the `cat-dev` and `cat-stage` with a PostgreSQL database instance up and running in those two namespaces.


## Calling the pipelines

In order to call one of the build pipelines in `cat-ci`, either call 

```bash
./pipeline.sh build-client -u <reg-user> \
	-p <reg-password>
```

or 
```bash
./pipeline.sh build-server -u <reg-user> \
	-p <reg-password>
```


This starts the development pipelines as discussed in chapter 5. Whenever the pipeline is successfully executed, you should see an updated message on the `grumpycat-config` Git repository. And you should see that ArgoCD has initiated a synchronization process, which ends with a redeployment of the Quarkus application.

To start one of the staging pipelines, either call
```bash
$ ./pipeline.sh stage-client -r v1.0.1-testing
```

or

To start one of the staging pipelines, either call
```bash
$ ./pipeline.sh stage-server -r v1.0.1-testing
```

This creates a new branch in Git called `release-v1.0.1-testing`, uses the current DEV image, tags it on quay.io and updates the `stage` config in git. 

In order to apply the changes, you need to either merge the branch directly or create a pull request and merge the changes then. 

