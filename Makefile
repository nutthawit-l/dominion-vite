builder:
	distrobox assemble create --replace --name vite-builder --file distrobox.ini

enter:
	distrobox enter vite-builder