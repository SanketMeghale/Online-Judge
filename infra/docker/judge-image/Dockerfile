# Multi-language Judge Runner Docker Image
FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

# Install compilers, interpreters, and system utilities
RUN apt-get update && apt-get install -y \
    build-essential \
    g++ \
    gcc \
    python3 \
    python3-pip \
    openjdk-21-jdk-headless \
    nodejs \
    npm \
    curl \
    time \
    && rm -rf /var/lib/apt/lists/*

# Create unprivileged sandbox user
RUN useradd -m -s /bin/bash sandbox

WORKDIR /app

COPY runner.sh /app/runner.sh
RUN chmod +x /app/runner.sh

USER sandbox

ENTRYPOINT ["/app/runner.sh"]
