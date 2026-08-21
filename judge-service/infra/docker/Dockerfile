# ==============================================================================
# Multi-Language Secure Sandbox Dockerfile for Online Judge
# Supported Languages: Python 3, C (gcc), C++ (g++), Java (openjdk)
# Security Features: Non-root user execution, hardened toolchains, minimal footprint
# ==============================================================================

# 1. Base Image: Use official Ubuntu Minimal 24.04 LTS for stability & modern toolchains
FROM ubuntu:24.04

# 2. Environment Variables: Prevent interactive prompts during apt-get package installation
ENV DEBIAN_FRONTEND=noninteractive \
    LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    PYTHONUNBUFFERED=1

# 3. Install Compilers, Runtimes, and Utilities
# - gcc & g++: C/C++ Compilers
# - openjdk-21-jdk-headless: Lightweight Java 21 JDK without GUI overhead
# - python3 & python3-pip: Python 3.12+ interpreter
# - time & coreutils: Resource tracking utilities for measuring execution runtime & memory
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    openjdk-21-jdk-headless \
    nodejs \
    python3 \
    time \
    coreutils \
    bash \
    && rm -rf /var/lib/apt/lists/*

# 4. Security Hardening: Create a non-privileged user and group for executing untrusted code
# System User UID: 10001 (sandboxuser), Group GID: 10001 (sandboxgroup)
RUN groupadd -g 10001 sandboxgroup && \
    useradd -u 10001 -g sandboxgroup -m -s /bin/bash sandboxuser

# 5. Create Sandbox Execution Directory & Permissions
WORKDIR /workspace
RUN mkdir -p /workspace /opt/judge/scripts && \
    chown -R sandboxuser:sandboxgroup /workspace /opt/judge && \
    chmod 755 /workspace /opt/judge

# 6. Copy Execution & Compilation Scripts into Image
COPY scripts/ /opt/judge/scripts/
RUN sed -i 's/\r$//' /opt/judge/scripts/*.sh && \
    chmod +x /opt/judge/scripts/*.sh && \
    chown -R sandboxuser:sandboxgroup /opt/judge/scripts

# 7. Switch to Non-Root Sandbox User
USER sandboxuser

# 8. Entrypoint Set to Bash
ENTRYPOINT ["/bin/bash"]
