# Getting GitOps. 
## GitOps sample

This is the sample discussed in chapter 5. It's about using Tekton and ArgoCD. 

You have to do the following three steps in order to setup the environment. 

## 1. Prepare your environment

### a. forking git repositories
Please make sure that you're forking the following two repositories on GitHub.com
- (Source Code)[https://github.com/wpernath/quarkus-grumpycat]
- (Configuration)[https://github.com/wpernath/grumpycat-config]

### b. prepare pipelines
Then you have to make sure that all the defaults are pointing to YOUR repositories:
```
FOR EACH pipeline in ${gitops/tekton/pipelines} DO
  spec.params.git-url -> your forked git url
  spec.params.config-git-url -> your forked git url
  spec.params.image-name -> your quay.io or dockerhub.io repository name
  spec.params.repo-username -> your user name on quay.io or dockerhub.io or whereever
END
```

OR 

You can enhance `gitops/tekton/pipeline.sh` to let you specify those parameters accordingly.

### c. prepare argo cd applications
Finally, you have to open `gitops/argocd/cat-apps.yaml` and

```
FOR EACH $(argocd application in cat-apps.yaml) DO
  spec.source.repoURL -> your grumpycat config repository
END
```


## 2. Setup Tekton Pipelines (the CI part)
In order to initialize the Tekton pipelines, call

```bash
$ ./pipeline.sh init --force --git-user <user> \
	--git-password <pwd> \
	--registry-user <user> \
	--registry-password <pwd> 
```

This call (if given the `--force` flag) will initialize the `cat-ci` namespace for you. This includes
- all 4 tekton pipelines
- all custom tasks
- preparation of the Tekton service account for running the pipelines
- preparation of the Tekton secret to access GitHub.com and Quay.io



## 3. Setup ArgoCD Applications (the CD part)

To initialize the ArgoCD part, call the following

```bash
$ oc apply -k gitops/argocd
```

This will create two namespaces with all roles properly setup so that Argo CD can then start initializing the environment. It will take a while until you're able to see the `cat-dev` and `cat-stage` namespaces with the two versions of the app deployed in. 

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

