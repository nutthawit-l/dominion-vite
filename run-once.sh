#!/usr/bin/bash

# Run this once after creating your first distrobox.

set -x

# Clone project
# [ ! -d "${HOME}/dominion-vite" ] && git clone git@github.com:nutthawit-l/dominion-vite.git "${HOME}/dominion-vite"

# Install pnpm
sudo npm install -g pnpm@latest-10

# Install Golang
[ ! -f "${HOME}/go.tar.gz" ] && curl -o "${HOME}/go.tar.gz" https://dl.google.com/go/go1.26.1.linux-amd64.tar.gz; sudo rm -rf /usr/local/go && sudo tar -C /usr/local -xzf "${HOME}/go.tar.gz"
[ ! -f "${HOME}/.bashrc" ] && echo "export PATH=/usr/local/go/bin:${HOME}/go/bin:${PATH}" > "${HOME}/.bashrc" && source "${HOME}/.bashrc"

#  Install air for hot-reloading
[ ! -f "${HOME}/go/bin/air" ] && /usr/local/go/bin/go install github.com/air-verse/air@latest

# Install VSCode
init_hooks=[ ! -f "${HOME}/code.rpm" ] && curl -o code.rpm https://vscode.download.prss.microsoft.com/dbazure/download/stable/e7fb5e96c0730b9deb70b33781f98e2f35975036/code-1.114.0-1775036339.el8.x86_64.rpm;
init_hooks=zypper --non-interactive --no-gpg-checks install "${HOME}/code.rpm";

# Install Antigravity
sudo zypper --non-interactive addrepo --refresh --no-gpgcheck https://us-central1-yum.pkg.dev/projects/antigravity-auto-updater-dev/antigravity-rpm antigravity-rpm
sudo zypper refresh
sudo zypper in -y antigravity

# distrobox-host-exec: เป็นคำสั่งพิเศษที่ติดมากับ Distrobox ทำหน้าที่ส่งคำสั่งจากใน Box ออกไปรันที่เครื่องจริง (Host)
# เมื่อคุณคลิกลิงก์ใน VS Code มันจะเรียก xdg-open -> วิ่งไปหา distrobox-host-exec -> ส่งลิงก์ไปที่ Host -> Host ใช้ Firefox Flatpak เปิดให้ทันที
sudo ln -sf /usr/bin/distrobox-host-exec /usr/local/bin/xdg-open

# เพื่อให้แน่ใจว่าเครื่อง Host จะเปิด Firefox Flatpak จริงๆ ให้เช็คว่าคุณตั้งค่า Firefox เป็น Default Browser หรือยัง:
# 1) เปิด System Settings > Applications > Default Applications
# 2) ตรง Web Browser ตรวจสอบว่าเป็น Firefox (ตัวที่เป็น Flatpak) หรือยัง