# Judge Docker Container Setup

This directory contains the Docker configuration for building the isolated multi-language code evaluation container.

## Pre-requisites
- Docker Desktop / Docker Engine

## Build Image

```bash
docker build -t online-judge-runner:local infra/docker/judge-image
```

## Test Container Run

```bash
# Test Python 3 inside sandbox
docker run --rm online-judge-runner:local python /app/example.py
```
