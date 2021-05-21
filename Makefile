local-env:
	./run-local-env.sh

include ./_build/Makefile

help:
	@echo "Usage:"
	@echo "  make build            - to build app runner image"
	@echo "  make local-env        - to run localstack and other deps in docker"
	@echo "  make unit-tests       - to run unit tests"
	@echo "  make static-analysis  - to run static analysis with eslint and flow"
	@echo "  make help             - to see this message"
