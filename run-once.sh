#!/usr/bin/bash

# Run this once after creating your first distrobox.

set -x

# Clone project
# [ ! -d "${HOME}/dominion-vite" ] && git clone git@github.com:nutthawit-l/dominion-vite.git "${HOME}/dominion-vite"

# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc

# Install Nodejs
nvm install v24.14.1

# Install pnpm
npm install -g pnpm@latest-10

# Install Golang
[ ! -f "${HOME}/go.tar.gz" ] && curl -o "${HOME}/go.tar.gz" https://dl.google.com/go/go1.26.1.linux-amd64.tar.gz; sudo rm -rf /usr/local/go && sudo tar -C /usr/local -xzf "${HOME}/go.tar.gz"; echo "export PATH=/usr/local/go/bin:${HOME}/go/bin:${PATH}" >> "${HOME}/.bashrc" && source "${HOME}/.bashrc"
source ~/.bashrc

#  Install air for hot-reloading
[ ! -f "${HOME}/go/bin/air" ] && /usr/local/go/bin/go install github.com/air-verse/air@latest

# Install VSCode
echo "code code/add-microsoft-repo boolean true" | sudo debconf-set-selections
[ ! -f "${HOME}/code.deb" ] && curl -o code.deb https://vscode.download.prss.microsoft.com/dbazure/download/stable/e7fb5e96c0730b9deb70b33781f98e2f35975036/code_1.114.0-1775036290_amd64.deb
sudo apt install -y ./code.deb

# Install Antigravity
# sudo zypper --non-interactive addrepo --refresh --no-gpgcheck https://us-central1-yum.pkg.dev/projects/antigravity-auto-updater-dev/antigravity-rpm antigravity-rpm
# sudo zypper refresh
# sudo zypper in -y antigravity

# distrobox-host-exec: A utility that forwards commands from the container to the host.
# Clicking a link in VS Code triggers: xdg-open -> distrobox-host-exec -> Host machine.
# The host then opens the link in the default browser (e.g., Firefox Flatpak).
sudo ln -sfv /usr/bin/distrobox-host-exec /usr/local/bin/xdg-open

# To ensure it opens in Firefox Flatpak, verify your default browser settings:
# 1) Open System Settings > Applications > Default Applications.
# 2) Under 'Web Browser', select the Firefox (Flatpak) entry.
