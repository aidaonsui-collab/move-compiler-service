FROM node:18-slim

# Install dependencies for building Sui
RUN apt-get update && apt-get install -y \
    curl \
    git \
    build-essential \
    pkg-config \
    libssl-dev \
    clang \
    libclang-dev \
    llvm \
    cmake \
    && rm -rf /var/lib/apt/lists/*

# Install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Install Sui CLI
RUN cargo install --locked --git https://github.com/MystenLabs/sui.git --branch mainnet sui

# Set up app
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY server.js ./

EXPOSE 3001

CMD ["node", "server.js"]
