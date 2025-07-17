#!/bin/sh
echo "Removing all finalizers on cat-dev, cat-stage, cat-prod and grumpycat"

oc patch kafkatopic player-actions -n cat-prod -p '{"metadata":{"finalizers":[]}}' --type=merge
oc patch kafkatopic player-actions -n cat-stage -p '{"metadata":{"finalizers":[]}}' --type=merge
oc patch kafkatopic player-actions -n cat-dev -p '{"metadata":{"finalizers":[]}}' --type=merge

oc patch kafkatopic player-actions -n grumpycat -p '{"metadata":{"finalizers":[]}}' --type=merge

echo "Done!"
