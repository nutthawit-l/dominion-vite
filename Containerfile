FROM registry.opensuse.org/opensuse/tumbleweed:20260315

# Install Node.js 24 and essential tools
RUN zypper --non-interactive install --no-recommends \
    nodejs24 \
    npm24 \
    bash \
    git \
    curl \
    tar \
    gzip \
    which \
    wget \
    gawk \
    && zypper clean --all

# Install pnpm globally using npm
RUN npm install -g pnpm@latest-10

# Install Go following official documentation (go1.26.1)
RUN curl -OL https://go.dev/dl/go1.26.1.linux-amd64.tar.gz && \
    rm -rf /usr/local/go && tar -C /usr/local -xzf go1.26.1.linux-amd64.tar.gz && \
    rm go1.26.1.linux-amd64.tar.gz

# Set Go environment paths
ENV PATH=$PATH:/usr/local/go/bin:/root/go/bin

# Set working directory
WORKDIR /app/dominion

# Copy package files first for better caching
COPY dominion/package.json dominion/pnpm-lock.yaml* ./

# Install dependencies
# Note: If you have a workspace, you might need to adjust this
RUN pnpm install

# Copy the rest of the application source code
COPY dominion/* .

# Move to Backend directory
WORKDIR /app/dominion-api

# Copy go mod and sum files
COPY dominion-api/go.mod dominion-api/go.sum ./

# Download dependencies
RUN go mod download

# Copy the rest of the application
COPY dominion-api/* .

# Install air for hot-reloading
RUN go install github.com/air-verse/air@latest

