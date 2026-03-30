FROM ubuntu:22.04

# Install Node.js 18 and dependencies
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    gnupg \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_18.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Download pre-built Sui CLI (fresh download every time - no cache)
RUN curl -fsSL https://github.com/MystenLabs/sui/releases/download/mainnet-v1.68.1/sui-mainnet-v1.68.1-ubuntu-x86_64.tgz \
    --output /tmp/sui.tgz \
    && tar -xzf /tmp/sui.tgz -C /tmp \
    && cp /tmp/sui-mainnet-v1.68.1-ubuntu-x86_64/sui /usr/local/bin/sui \
    && chmod +x /usr/local/bin/sui \
    && rm -rf /tmp/sui* \
    && sui --version || echo "Sui CLI installed"

# Set up app
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY server.js ./

EXPOSE 3001

CMD ["node", "server.js"]
