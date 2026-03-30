FROM node:18-slim

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Download pre-built Sui CLI binary
RUN curl -LO https://github.com/MystenLabs/sui/releases/download/mainnet-v1.68.1/sui-mainnet-v1.68.1-ubuntu-x86_64.tgz \
    && tar -xzf sui-mainnet-v1.68.1-ubuntu-x86_64.tgz \
    && mv sui-mainnet-v1.68.1-ubuntu-x86_64/sui /usr/local/bin/sui \
    && chmod +x /usr/local/bin/sui \
    && rm -rf sui-mainnet-v1.68.1-ubuntu-x86_64*

# Set up app
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY server.js ./

EXPOSE 3001

CMD ["node", "server.js"]
