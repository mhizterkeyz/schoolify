export CI_COMMIT_REF_NAME ?= $(shell git rev-parse --abbrev-ref HEAD)
export CI_COMMIT_SHA ?= $(shell git rev-parse HEAD)
export CI_SERVER ?= no
export BUILD_TIME ?= $(shell date +"%Y-%m-%dT%H:%M:%SZ%Z")
export TAG_NAME = :${CI_COMMIT_SHA}
export UPDATE_TAG ?= :master-hash-$(shell git merge-base `git rev-parse HEAD` origin/master)
export VERSION_TAG ?= :version-$(shell date | sed -e 's:\ :-:g' | sed -e 's:\::-:g' | cut -c1-16)
export IMAGE_REPO = $(shell echo $1 | cut -d: -f 1)

export RED=\033[0;31m
export NC=\033[0m

# remote registry address
export REGISTRY_ADDRESS = 847883372847.dkr.ecr.us-west-2.amazonaws.com/enterpriseapi/$(env)/

$(info registry is $(REGISTRY_ADDRESS))

# don't tag, don't use remote registry for local development
ifeq ($(CI_SERVER), no)
	REGISTRY_ADDRESS =
	TAG_NAME =
endif

# don't tag, use test remote registry
ifeq ($(TEST), yes)
	REGISTRY_ADDRESS = test-
	TAG_NAME =
endif

# push images only from CI server
export PUSH_CMD = docker push $1; \
									docker tag $1 ${IMAGE_REPO}:latest && docker push ${IMAGE_REPO}:latest;

ifeq ($(CI_SERVER), no)
	PUSH_CMD = @echo "${RED}local dev: skip pushing of $1${NC}"
endif
define push_image
	$(PUSH_CMD)
endef

export PREVIOUS_TAG = $(shell echo ${1} | cut -d: -f 1 ):$(shell git rev-parse HEAD~1)
export PULL_CMD = docker pull $1 || docker pull $(PREVIOUS_TAG); docker tag $(PREVIOUS_TAG) $1 || true
# pull images only from CI server
ifeq ($(CI_SERVER), no)
	PULL_CMD = @echo "${RED}local dev: skip pulling of $1, you might need to build it${NC}"
endif
define pull_image
	$(PULL_CMD)
endef

export NODE_RUNNER = ${REGISTRY_ADDRESS}runner${TAG_NAME}

build: node

node:
	docker build -f ./Dockerfile -t ${NODE_RUNNER} .
	docker tag ${NODE_RUNNER} app/runner
	$(call push_image,${NODE_RUNNER})
