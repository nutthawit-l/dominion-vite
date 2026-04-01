IMAGE_NAME = dominion-vite
CONTAINER_NAME = dominion-vite
PORT = 5173

.PHONY: builder enter build run debug stop clean rebuild help logs

help:
	@echo "Usage: make [target]"
	@echo "  builder  Build the builder container using distrobox"
	@echo "  enter    Enter the builder container
	@echo "  build    Build the container image"
	@echo "  run      Run the container on port $(PORT)"
	@echo "  logs     Follow container logs"
	@echo "  stop     Stop and remove the container"
	@echo "  clean    Remove the image"

build:
	distrobox assemble create

clean:
	distrobox assemble rm

rebuild: clean build

enter:
	distrobox enter dominion-vite

enter-v:
	distrobox enter -v dominion-vite

# Below commands need to run inside distrobox

run-backend:
	cd /home/tie/dominion/dominion-api && $(HOME)/go/bin/air -c .air.toml

run-frontend: 
	cd /home/tie/dominion/dominion && pnpm dev
