IMAGE_NAME = dominion-vite
CONTAINER_NAME = dominion-vite
PORT = 5173

.PHONY: help build clean rebuild enter enter-v init run-backend run-frontend install-backend install-frontend install-test

help:
	@echo "Usage: make [target]"
	@echo "  build    			Build the distrobox container"
	@echo "  clean    			Remove the distrobox container"
	@echo "  rebuild			Remove and build the distrobox container"
	@echo "  enter    			Enter the distrobox container"
	@echo "  enter-v  			Enter the distrobox container with verbose option"
	@echo "  init     			Setup development environment in distrobox container"
	@echo "  run-backend		Run dominion-api"
	@echo "  run-frontend   	Run dominion"
	@echo "  install-backend	cd $(HOME)/dominion-api && go mod download"
	@echo "  install-frontend  	cd $(HOME)/dominion && pnpm install"
	@echo "  install-test		cd $(HOME)/dominion && pnpm create playwright"


build:
	distrobox assemble create

clean:
	distrobox assemble rm

rebuild: clean build

enter:
	distrobox enter $(CONTAINER_NAME)

enter-v:
	distrobox enter -v $(CONTAINER_NAME)

# The following commands must be executed within a Distrobox container

init:
	bash run-once.sh

run-backend:
	cd $(HOME)/dominion-api && $(HOME)/go/bin/air -c .air.toml

run-frontend: 
	cd $(HOME)/dominion && pnpm dev

install-backend:
	cd $(HOME)/dominion-api && go mod download

install-frontend:
	cd $(HOME)/dominion && pnpm install

install-test:
	cd $(HOME)/dominion && pnpm create playwright && pnpm add playwright playwright-extra puppeteer puppeteer-extra puppeteer-extra-plugin-stealth

