# Use official Sui image as builder to get the binary
FROM mysten/sui-tools:mainnet AS sui-builder

# Main application image
FROM node:18-slim

# Install git (required by sui move build)
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# Copy Sui binary from builder
COPY --from=sui-builder /usr/local/bin/sui /usr/local/bin/sui

# Verify Sui installation
RUN sui --version

# Set up app
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY server.js ./

EXPOSE 3001

CMD ["node", "server.js"]
