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

builder:
	distrobox assemble create --replace --name vite-builder --file distrobox.ini

enter:
	distrobox enter vite-builder

enter-v:
	distrobox enter vite-builder -v

build:
	podman build -t $(IMAGE_NAME) .

run: stop
	podman run -d --name $(CONTAINER_NAME) -p $(PORT):5173 $(IMAGE_NAME)
	@echo "App running at http://localhost:$(PORT)"

stop:
	-podman stop $(CONTAINER_NAME)
	-podman rm $(CONTAINER_NAME)

clean: stop
	-podman rmi $(IMAGE_NAME)

rebuild: clean build

logs:
	podman logs -f $(CONTAINER_NAME)

compose-up:
	podman compose up

compose-down:
	podman compose down

compose-up-build:
	podman compose up --build

