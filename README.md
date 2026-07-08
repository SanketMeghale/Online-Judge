# Online Judge

Online Judge is a modern coding practice and contest platform inspired by systems like LeetCode and Codeforces. It is designed to support secure code execution, automated evaluation, live contests, team battles, realtime collaboration, AI-assisted interview practice, and learner gamification.

The project follows a multi-service architecture so that core judging, realtime updates, AI workflows, and the user-facing application can scale independently.

## Project Overview

The platform allows users to browse programming problems, write solutions in a browser-based editor, run custom test cases, and submit code for automated judging. Submitted code is evaluated inside isolated Docker containers by distributed judge workers, which helps keep execution secure and prevents long-running programs from blocking the main API.

Beyond normal problem solving, the system includes contest support with realtime leaderboards, team-based contests, collaborative coding rooms, and an AI interviewer module that can simulate technical interviews and generate feedback reports.

## Main Features

- JWT-based user authentication and profile management
- Problem management with topics, difficulty levels, statements, samples, and hidden test cases
- Multi-language code submission support for C, C++, Java, and Python
- Docker-based judging with verdicts such as AC, WA, CE, RE, TLE, MLE, and SYSTEM_ERROR
- Custom test case runner for quick local-style execution
- Live individual and team contests
- Realtime contest leaderboard updates using WebSocket communication
- Collaboration rooms with shared code editing support
- AI interviewer service for mock technical interviews and feedback
- Gamification through XP, streaks, badges, and lightweight coding games
- Redis-backed caching for leaderboards, cooldown checks, pub/sub events, and presence

## Architecture

The system is split into focused services:

```text
apps/
  web/                  React + Vite frontend

services/
  api/                  Node.js + Express REST API
  realtime/             Socket.io realtime service
  judge-worker/         RabbitMQ consumer for judging submissions
  ai-service/           Python FastAPI AI interviewer service

packages/
  shared/               Shared constants and contracts

infra/
  docker/               Docker assets and judge image
  scripts/              Developer automation scripts

docs/
  architecture/         Architecture notes
  api/                  API endpoint documentation
  database/             Database design notes
```

## Core Workflow

1. A user submits code from the web app.
2. The API validates the JWT, checks rate limits, stores a queued submission in MongoDB, and publishes a job to RabbitMQ.
3. A judge worker consumes the job and runs the submitted code inside an isolated Docker container.
4. The worker compares output against hidden test cases and updates the submission verdict.
5. Redis pub/sub notifies the realtime service.
6. The frontend receives the verdict instantly over WebSocket.
7. If the submission belongs to a contest, the leaderboard is recalculated and broadcast to participants.

## Tech Stack

- **Frontend:** React, Vite, Monaco Editor
- **Backend API:** Node.js, Express
- **Realtime:** Socket.io, Yjs
- **Judge Workers:** Node.js, Docker
- **AI Service:** Python, FastAPI
- **Database:** MongoDB
- **Cache / Pub-Sub:** Redis
- **Queue:** RabbitMQ
- **Authentication:** JWT, bcrypt

## Local Infrastructure

The local development stack uses Docker Compose for shared infrastructure:

```bash
docker compose up -d mongo redis rabbitmq
```

The judge runtime image can be built from:

```bash
docker build -t online-judge-runner:local infra/docker/judge-image
```

## Current Status

This repository currently contains the initial project structure and documentation foundation based on the HLD. Service implementations will be added incrementally, starting with authentication, problem management, submissions, and the judge execution pipeline.
