#!/bin/bash
# This starts the pipeline new-pipeline with a given 

set -e -u -o pipefail
declare -r SCRIPT_DIR=$(cd -P $(dirname $0) && pwd)
declare COMMAND="help"

GIT_URL=https://github.com/wpernath/grumpycat-config.git
GIT_REVISION=release-v0.6.x
GIT_USER=""
GIT_PASSWORD=""
ARGO_SERVER=""
ARGO_USER=""
ARGO_PASSWORD=""

PIPELINE=dev-pipeline
CONTEXT_DIR=.
IMAGE_NAME=quay.io/wpernath/quarkus-grumpycat
IMAGE_USER=wpernath
IMAGE_PASSWORD=
TARGET_NAMESPACE=cat-ci
FORCE_SETUP="false"

valid_command() {
  local fn=$1; shift
  [[ $(type -t "$fn") == "function" ]]
}

info() {
    printf "\n# INFO: $@\n"
}

err() {
  printf "\n# ERROR: $1\n"
  exit 1
}

command.help() {
  cat <<-EOF
  Starts a new pipeline in current kubernetes context

  Usage:
      pipeline.sh [command] [options]
  
  Examples:
      pipeline.sh init [--force] --git-user <user> --git-password <pwd> --registry-user <user> --registry-password <password> --argo-host <argo host> --argo-user <user name> --argo-password <password>
      pipeline.sh build-all -r <source-branch> -p <target registry pwd>
      pipeline.sh build-client -u wpernath -p <nope> 
      pipeline.sh build-server -u wpernath -p <nope> 

      pipeline.sh stage-all -r v1.2.5 
      pipeline.sh stage-client -r v1.2.5 [-g <config-git-rep>] 
      pipeline.sh stage-server -r v1.2.5 [-g <config-git-rep>] 
      pipeline.sh logs [-t <target-namespace]
  
  COMMANDS:
      init                           creates ConfigMap, Secrets, Tasks and Pipelines into $TARGET_NAMESPACE
      build-all                      starts both build pipelines as a pipeline
      build-client                   starts the client-dev-pipeline in $TARGET_NAMESPACE      
      build-server                   starts the dev-pipeline in $TARGET_NAMESPACE
      stage-all                      starts both stage pipelines as a pipeline
      stage-server                   starts the stage-pipeline in $TARGET_NAMESPACE
      stage-client                   starts the client-stage-pipeline in $TARGET_NAMESPACE
      logs                           shows logs of the last pipeline run in $TARGET_NAMESPACE
      help                           Help about this command

  OPTIONS:
      -u, --registry-user           User to store the image into quay.io ($IMAGE_USER)
      -p, --registry-password       Password to store the image into quay.io ($IMAGE_PASSWORD)
      --git-user                    User to read/write into github
      --git-password                Password to read/write into github
      --argo-host                   The ArgoCD server to use
      --argo-user                   The username of the ArgoCD server to use
      --argo-password               The password of the ArgoCD server to use
      -i, --target-image            Target image name to push to ($IMAGE_NAME)
      -c, --context-dir             Which context-dir to user ($CONTEXT_DIR)
      -t, --target-namespace        Which target namespace to start the app ($TARGET_NAMESPACE)
      -g, --git-repo                Which quarkus repository to clone ($GIT_URL)
      -r, --git-revision            Which git revision to use ($GIT_REVISION)
      -f, --force                   By default, this script assumes, you've created demo-setup/setup.yaml
                                    if you haven't, use this flag to force the setup of the summit-cicd NS
EOF
}

while (( "$#" )); do
  case "$1" in
    build-client|stage-client|logs|init|build-server|stage-server|build-all|stage-all)
      COMMAND=$1
      shift
      ;;
    -f|--force)
      FORCE_SETUP="true"
      shift 1
      ;;
    -c|--context-dir)
      CONTEXT_DIR=$2
      shift 2
      ;;
    --argo-host)
      ARGO_SERVER=$2
      shift 2
      ;;
    --argo-user)
      ARGO_USER=$2
      shift 2
      ;;
    --argo-password)
      ARGO_PASSWORD=$2
      shift 2
      ;;

    -i|--target-image)
      IMAGE_NAME=$2
      shift 2
      ;;
    -t|--target-namespace)
      TARGET_NAMESPACE=$2
      shift 2
      ;;
    -u|--registry-user)
      IMAGE_USER=$2
      shift 2
      ;;
    -p|--registry-password)
      IMAGE_PASSWORD=$2
      shift 2
      ;;
    -a|--git-user)
      GIT_USER=$2
      shift 2
      ;;
    -b|--git-password)
      GIT_PASSWORD=$2
      shift 2
      ;;
    -g|--git-repo)
      GIT_URL=$2
      shift 2
      ;;
    -r|--git-revision)
      GIT_REVISION=$2
      shift 2
      ;;
    -l|--pipeline)
      PIPELINE=$2
      shift 2
      ;;
    --)
      shift
      break
      ;;
    -*|--*)
      command.help
      err "Error: Unsupported flag $1"
      ;;
    *) 
      break
  esac
done


command.init() {
  # This script imports the necessary files into the current project 
  pwd

echo "Using parameters:"
echo "   GIT_USER     : $GIT_USER"
echo "   GIT_PASSWORD : $GIT_PASSWORD"
echo "   REG_USER     : $IMAGE_USER"
echo "   REG_PASSWORD : $IMAGE_PASSWORD"
echo "   ARGO_SERVER  : $ARGO_SERVER"
echo "   ARGO_USER    : $ARGO_USER"
echo "   ARGO_PASSWORD: $ARGO_PASSWORD"
echo "   REG_USER     : $IMAGE_USER"

echo "   FORCE_SETUP  : $FORCE_SETUP "

  # prepare secrets for SA
  if [ -z $GIT_USER ]; then 
    command.help
    err "You have to provide credentials via --git-user"
  fi

  if [ -z $GIT_PASSWORD ]; then 
    command.help
    err "You have to provide credentials via --git-password"
  fi

  if [ -z $IMAGE_USER ]; then 
    command.help
    err "You have to provide credentials via --registry-user"
  fi

  if [ -z $IMAGE_PASSWORD ]; then 
    command.help
    err "You have to provide credentials via --registry-password"
  fi

  if [ -z $ARGO_USER ]; then
    info "No ArgoCD users etc provided. You can't start build-all pipeline "
  fi 

  # install secret and configmap for accessing ARgoCD
  if [ -n $ARGO_USER ]; then
    info "Installing ArgoCD Secret and ConfigMap..."
    cat > /tmp/secret-argo.yaml <<-EOF
apiVersion: v1
kind: Secret
metadata:
  name: argocd-env-secret 
stringData:
  ARGOCD_USERNAME: $ARGO_USER
  ARGOCD_PASSWORD: $ARGO_PASSWORD
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-env-configmap
data:
  ARGOCD_SERVER: $ARGO_SERVER
EOF
  fi

  # installing secrets to access github and quay.io
  info "Installing Secrets to access GitHub and Quay.io"
  cat > /tmp/secret.yaml <<-EOF
apiVersion: v1
kind: Secret
metadata:
  name: git-user-pass
  annotations:
    tekton.dev/git-0: https://github.com # Described below
type: kubernetes.io/basic-auth
stringData:
  username: $GIT_USER
  password: $GIT_PASSWORD
---
apiVersion: v1
kind: Secret
metadata:
  annotations:
    tekton.dev/docker-0: https://quay.io
  name: quay-push-secret
type: kubernetes.io/basic-auth
stringData:
  username: $IMAGE_USER
  password: $IMAGE_PASSWORD
EOF

  # apply all tekton related setup
  if [[ "$FORCE_SETUP" == "true" ]]; then
    info "Creating demo setup by calling $SCRIPT_DIR/kustomization.yaml"
    oc apply -k "$SCRIPT_DIR" -n $TARGET_NAMESPACE

    while :; do
      oc get ns/cat-ci > /dev/null && break
      sleep 2
    done
  fi

  oc apply -f /tmp/secret.yaml -n $TARGET_NAMESPACE

  if [ -n $ARGO_USER ]; then
    oc apply -f /tmp/secret-argo.yaml -n $TARGET_NAMESPACE
  fi
}


command.logs() {
    tkn pr logs -f -L -n $TARGET_NAMESPACE
}

command.stage-server() {
  info "Start staging server service on OpenShift..."
  tkn pipeline start stage-server \
            -s pipeline-bot \
            -p release-name=$GIT_REVISION \
            -p git-revision=ae-event \
            -w name=shared-workspace,claimName=builder-pvc \
            --use-param-defaults

}

command.build-server() {
  info "Start building server service on OpenShift..."
  tkn pipeline start build-server -s pipeline-bot \
            -p repo-password=$IMAGE_PASSWORD \
            -p git-revision=$GIT_REVISION \
            -p config-git-revision=ae-event \
            -w name=source,claimName=builder-pvc \
            -w name=maven-settings,config=maven-settings \
            --use-param-defaults
}

command.stage-client() {
  info "Start staging client on OpenShift..."
  tkn pipeline start stage-client \
            -s pipeline-bot \
            -p release-name=$GIT_REVISION \
            -w name=shared-workspace,claimName=client-builder-pvc \
            --use-param-defaults

}

command.build-client() {
  info "Start building client on OpenShift..."
  tkn pipeline start build-client -s pipeline-bot \
            -p repo-password=$IMAGE_PASSWORD \
            -p git-revision=$GIT_REVISION \

            # to be removed after AE event
            -p config-git-revision=ae-event \
            -w name=source,claimName=client-builder-pvc \
            -w name=maven-settings,config=maven-settings \
            --use-param-defaults
}


command.build-all() {
  info "Starting build-all pipeline..."
  tkn pipeline start build-all -s pipeline-bot \
               -p repository-password=$IMAGE_PASSWORD \
               -p git-revision=$GIT_REVISION \
               --use-param-defaults
}

command.stage-all() {
  info "Starting stage-all pipeline..."
  tkn pipeline start stage-all -s pipeline-bot \
                -p release-name=$GIT_REVISION
}

main() {
  local fn="command.$COMMAND"
  valid_command "$fn" || {
    command.help
    err "invalid command '$COMMAND'"
  }

  cd $SCRIPT_DIR
  $fn
  return $?
}

main
