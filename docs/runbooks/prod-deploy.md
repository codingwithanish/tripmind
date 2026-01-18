# Production Deployment

Guide for deploying TripMind to production.

## Overview

TripMind can be deployed using:
- **Docker Compose** - Simple single-server deployment
- **Kubernetes** - Scalable multi-node deployment

## Prerequisites

- Docker and Docker Compose
- Access to container registry
- Production environment variables

## Docker Deployment

### Build Images

```bash
# Build all services
docker-compose -f infra/docker/docker-compose.yml build
```

### Deploy

```bash
# Start services
docker-compose -f infra/docker/docker-compose.yml up -d

# View logs
docker-compose -f infra/docker/docker-compose.yml logs -f
```

## Kubernetes Deployment

### Prerequisites

- kubectl configured
- Access to Kubernetes cluster
- Helm (optional)

### Deploy with Kustomize

```bash
# Apply base configuration
kubectl apply -k infra/k8s/base

# Or apply environment overlay
kubectl apply -k infra/k8s/overlays/prod
```

### Verify Deployment

```bash
kubectl get pods -n tripmind
kubectl get services -n tripmind
```

## Environment Variables

Ensure all production secrets are configured:

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | Production MongoDB connection |
| `JWT_SECRET` | Strong random secret |
| `GOOGLE_CLIENT_ID` | OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret |

## Rollback

```bash
# Docker
docker-compose -f infra/docker/docker-compose.yml down
docker-compose -f infra/docker/docker-compose.yml up -d --build

# Kubernetes
kubectl rollout undo deployment/api-service -n tripmind
```
