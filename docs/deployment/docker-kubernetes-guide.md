# TripMind — Docker & Kubernetes Deployment Guide

Comprehensive guide for containerizing and deploying the TripMind application using Docker and Kubernetes.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Project Structure](#project-structure)
4. [Docker Setup](#docker-setup)
   - [Building Images](#building-images)
   - [Pushing Images to a Container Registry](#pushing-images-to-a-container-registry)
   - [Docker Compose (Production)](#docker-compose-production)
   - [Docker Compose (Development)](#docker-compose-development)
5. [Kubernetes Deployment](#kubernetes-deployment)
   - [Namespace Setup](#namespace-setup)
   - [Secrets Configuration](#secrets-configuration)
   - [Deploying with Kustomize](#deploying-with-kustomize)
6. [Environment Variables Reference](#environment-variables-reference)
7. [Service Details](#service-details)
8. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      Ingress (nginx)                    │
│              tripmind.com  │  api.tripmind.com          │
└─────────┬─────────────────┴──────────┬──────────────────┘
          │                            │
          ▼                            ▼
┌──────────────────┐        ┌────────────────────┐
│     web-ui       │        │    api-service      │
│  (nginx:80)      │        │  (Express:5000)     │
│  React + Vite    │        │  TypeScript + Prisma│
│  Static SPA      │        │  WebSocket (SO.IO)  │
└──────────────────┘        └─────┬──────────┬────┘
                                  │          │
                                  ▼          ▼
                      ┌──────────────┐  ┌──────────┐
                      │  ai-service   │  │ postgres │
                      │ (FastAPI:8001)│  │  (5432)  │
                      │ Google ADK    │  │ PostgreSQL│
                      └──────────────┘  └──────────┘
```

| Service | Technology | Port | Image |
|---------|-----------|------|-------|
| **web-ui** | React, Vite, nginx | 80 | `tripmind/web-ui` |
| **api-service** | Express, TypeScript, Prisma | 5000 | `tripmind/api-service` |
| **ai-service** | FastAPI, Google ADK, Python 3.11 | 8001 | `tripmind/ai-service` |
| **postgres** | PostgreSQL 16 | 5432 | `postgres:16-alpine` |

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------:|
| Docker | ≥ 24.0 | Container runtime |
| Docker Compose | ≥ 2.20 | Multi-container orchestration |
| kubectl | ≥ 1.28 | Kubernetes CLI |
| Kustomize | ≥ 5.0 | K8s config management (bundled with kubectl) |
| Node.js | ≥ 20 | Build web-ui & api-service |
| Python | ≥ 3.11 | Build ai-service |

For local K8s development, install one of:
- [Minikube](https://minikube.sigs.k8s.io/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (with Kubernetes enabled)
- [kind](https://kind.sigs.k8s.io/)

---

## Project Structure

```
tripmind/
├── apps/
│   └── web-ui/
│       ├── Dockerfile          ← Multi-stage: Node build → nginx
│       ├── .dockerignore
│       ├── nginx.conf          ← SPA fallback + API proxy
│       └── ...
├── services/
│   ├── api-service/
│   │   ├── Dockerfile          ← Multi-stage: TS build + Prisma
│   │   ├── .dockerignore
│   │   ├── prisma/             ← Schema + migrations
│   │   └── ...
│   └── ai-service/
│       ├── Dockerfile          ← Python 3.11 + FastAPI
│       ├── .dockerignore
│       └── ...
├── infra/
│   ├── docker/
│   │   ├── docker-compose.yml      ← Production compose
│   │   └── docker-compose.dev.yml  ← Dev overrides (hot-reload)
│   └── k8s/
│       ├── kustomization.yaml
│       └── base/
│           ├── configmap.yaml
│           ├── secrets.yaml        ← ⚠️ Template only
│           ├── postgres.yaml
│           ├── api-service.yaml
│           ├── ai-service.yaml
│           ├── web-ui.yaml
│           └── ingress.yaml
└── docs/
    └── deployment/
        └── docker-kubernetes-guide.md  ← This file
```

---

## Docker Setup

### Building Images

Build each service individually:

```bash
# Build web-ui
docker build -t tripmind/web-ui:latest ./apps/web-ui

# Build api-service
docker build -t tripmind/api-service:latest ./services/api-service

# Build ai-service
docker build -t tripmind/ai-service:latest ./services/ai-service
```

#### Build Arguments (web-ui)

The web-ui Dockerfile supports build-time arguments for Vite environment variables:

```bash
docker build \
  --build-arg VITE_API_BASE_URL=https://api.tripmind.com/api/v1 \
  --build-arg VITE_SOCKET_URL=https://api.tripmind.com \
  --build-arg VITE_GOOGLE_CLIENT_ID=your-google-client-id \
  -t tripmind/web-ui:latest ./apps/web-ui
```

> [!IMPORTANT]
> Vite injects environment variables at **build time**, not runtime. You must rebuild the image when changing `VITE_*` variables.

### Pushing Images to a Container Registry

After building images locally, you need to push them to a centralized container registry so that Kubernetes nodes (or other deployment targets) can pull them.

#### Image Tagging Convention

Use semantic versioning alongside `latest`:

```bash
# Tag with version and latest
docker tag tripmind/web-ui:latest       <REGISTRY>/tripmind/web-ui:1.0.0
docker tag tripmind/web-ui:latest       <REGISTRY>/tripmind/web-ui:latest
docker tag tripmind/api-service:latest  <REGISTRY>/tripmind/api-service:1.0.0
docker tag tripmind/api-service:latest  <REGISTRY>/tripmind/api-service:latest
docker tag tripmind/ai-service:latest   <REGISTRY>/tripmind/ai-service:1.0.0
docker tag tripmind/ai-service:latest   <REGISTRY>/tripmind/ai-service:latest
```

> [!TIP]
> For CI/CD, also tag with the Git commit SHA for traceability:
> `docker tag tripmind/web-ui:latest <REGISTRY>/tripmind/web-ui:$(git rev-parse --short HEAD)`

---

#### Option A: Docker Hub

The simplest option for public/private images.

```bash
# 1. Login to Docker Hub
docker login

# 2. Tag images (replace "yourusername" with your Docker Hub username)
docker tag tripmind/web-ui:latest       yourusername/tripmind-web-ui:latest
docker tag tripmind/web-ui:latest       yourusername/tripmind-web-ui:1.0.0
docker tag tripmind/api-service:latest  yourusername/tripmind-api-service:latest
docker tag tripmind/api-service:latest  yourusername/tripmind-api-service:1.0.0
docker tag tripmind/ai-service:latest   yourusername/tripmind-ai-service:latest
docker tag tripmind/ai-service:latest   yourusername/tripmind-ai-service:1.0.0

# 3. Push all images
docker push yourusername/tripmind-web-ui:latest
docker push yourusername/tripmind-web-ui:1.0.0
docker push yourusername/tripmind-api-service:latest
docker push yourusername/tripmind-api-service:1.0.0
docker push yourusername/tripmind-ai-service:latest
docker push yourusername/tripmind-ai-service:1.0.0

# 4. Verify on Docker Hub
#    Visit https://hub.docker.com/r/yourusername/tripmind-web-ui
```

For private repos, create a Kubernetes pull secret:

```bash
kubectl create secret docker-registry dockerhub-creds \
  --namespace=tripmind \
  --docker-server=https://index.docker.io/v1/ \
  --docker-username=yourusername \
  --docker-password=YOUR_ACCESS_TOKEN \
  --docker-email=your@email.com
```

Then add `imagePullSecrets` to your deployments:

```yaml
spec:
  template:
    spec:
      imagePullSecrets:
        - name: dockerhub-creds
```

---

#### Option B: AWS Elastic Container Registry (ECR)

Best for deployments on AWS EKS.

```bash
# 1. Create repositories (one-time setup)
aws ecr create-repository --repository-name tripmind/web-ui
aws ecr create-repository --repository-name tripmind/api-service
aws ecr create-repository --repository-name tripmind/ai-service

# 2. Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  123456789012.dkr.ecr.us-east-1.amazonaws.com

# 3. Tag images
export ECR_REGISTRY=123456789012.dkr.ecr.us-east-1.amazonaws.com
docker tag tripmind/web-ui:latest       $ECR_REGISTRY/tripmind/web-ui:latest
docker tag tripmind/web-ui:latest       $ECR_REGISTRY/tripmind/web-ui:1.0.0
docker tag tripmind/api-service:latest  $ECR_REGISTRY/tripmind/api-service:latest
docker tag tripmind/api-service:latest  $ECR_REGISTRY/tripmind/api-service:1.0.0
docker tag tripmind/ai-service:latest   $ECR_REGISTRY/tripmind/ai-service:latest
docker tag tripmind/ai-service:latest   $ECR_REGISTRY/tripmind/ai-service:1.0.0

# 4. Push all images
docker push $ECR_REGISTRY/tripmind/web-ui:latest
docker push $ECR_REGISTRY/tripmind/web-ui:1.0.0
docker push $ECR_REGISTRY/tripmind/api-service:latest
docker push $ECR_REGISTRY/tripmind/api-service:1.0.0
docker push $ECR_REGISTRY/tripmind/ai-service:latest
docker push $ECR_REGISTRY/tripmind/ai-service:1.0.0

# 5. Verify
aws ecr describe-images --repository-name tripmind/web-ui
```

> [!NOTE]
> ECR login tokens expire after **12 hours**. For EKS clusters, IAM roles handle authentication automatically.

---

#### Option C: Google Cloud Artifact Registry (GCP)

Best for deployments on GKE.

```bash
# 1. Create repository (one-time setup)
gcloud artifacts repositories create tripmind \
  --repository-format=docker \
  --location=us-central1 \
  --description="TripMind Docker images"

# 2. Configure Docker authentication
gcloud auth configure-docker us-central1-docker.pkg.dev

# 3. Tag images
export GAR_REGISTRY=us-central1-docker.pkg.dev/YOUR_PROJECT_ID/tripmind
docker tag tripmind/web-ui:latest       $GAR_REGISTRY/web-ui:latest
docker tag tripmind/web-ui:latest       $GAR_REGISTRY/web-ui:1.0.0
docker tag tripmind/api-service:latest  $GAR_REGISTRY/api-service:latest
docker tag tripmind/api-service:latest  $GAR_REGISTRY/api-service:1.0.0
docker tag tripmind/ai-service:latest   $GAR_REGISTRY/ai-service:latest
docker tag tripmind/ai-service:latest   $GAR_REGISTRY/ai-service:1.0.0

# 4. Push all images
docker push $GAR_REGISTRY/web-ui:latest
docker push $GAR_REGISTRY/web-ui:1.0.0
docker push $GAR_REGISTRY/api-service:latest
docker push $GAR_REGISTRY/api-service:1.0.0
docker push $GAR_REGISTRY/ai-service:latest
docker push $GAR_REGISTRY/ai-service:1.0.0

# 5. Verify
gcloud artifacts docker images list $GAR_REGISTRY
```

---

#### Updating Kubernetes Manifests After Push

Once images are pushed to a registry, update the `image` field in each K8s deployment manifest:

```yaml
# Example: infra/k8s/base/api-service.yaml
containers:
  - name: api-service
    image: us-central1-docker.pkg.dev/my-project/tripmind/api-service:1.0.0
    #                                ↑ replace with your actual registry path
```

Or use `kustomize` image overrides without modifying base manifests:

```yaml
# infra/k8s/kustomization.yaml
images:
  - name: tripmind/web-ui
    newName: us-central1-docker.pkg.dev/my-project/tripmind/web-ui
    newTag: "1.0.0"
  - name: tripmind/api-service
    newName: us-central1-docker.pkg.dev/my-project/tripmind/api-service
    newTag: "1.0.0"
  - name: tripmind/ai-service
    newName: us-central1-docker.pkg.dev/my-project/tripmind/ai-service
    newTag: "1.0.0"
```

> [!WARNING]
> Avoid using the `latest` tag in production K8s manifests. Always pin to a specific version (e.g., `1.0.0` or a Git SHA) so rollbacks and audits are reliable.

---

#### Quick Reference: Build → Tag → Push (all services)

A one-shot script to build, tag, and push all three services:

```bash
#!/bin/bash
set -e

REGISTRY="${1:?Usage: ./push-images.sh <REGISTRY> <TAG>}"
TAG="${2:-latest}"

SERVICES=("apps/web-ui:web-ui" "services/api-service:api-service" "services/ai-service:ai-service")

for entry in "${SERVICES[@]}"; do
  CONTEXT="${entry%%:*}"
  NAME="${entry##*:}"

  echo "══════════════════════════════════════"
  echo "  Building & pushing ${NAME}:${TAG}"
  echo "══════════════════════════════════════"

  docker build -t "${REGISTRY}/${NAME}:${TAG}" "./${CONTEXT}"
  docker push "${REGISTRY}/${NAME}:${TAG}"
done

echo "✅ All images pushed to ${REGISTRY} with tag ${TAG}"
```

Usage:
```bash
# Docker Hub
./scripts/push-images.sh yourusername/tripmind 1.0.0

# AWS ECR
./scripts/push-images.sh 123456789012.dkr.ecr.us-east-1.amazonaws.com/tripmind 1.0.0

# GCP Artifact Registry
./scripts/push-images.sh us-central1-docker.pkg.dev/my-project/tripmind 1.0.0
```

### Docker Compose (Production)

Start all services with a single command:

```bash
# Navigate to project root
cd tripmind

# Create a .env file for secrets
cp infra/docker/env/.env.example infra/docker/.env
# Edit the .env file with your actual values

# Start all services
docker compose -f infra/docker/docker-compose.yml up -d

# Check status
docker compose -f infra/docker/docker-compose.yml ps

# View logs
docker compose -f infra/docker/docker-compose.yml logs -f

# Stop all services
docker compose -f infra/docker/docker-compose.yml down
```

The production compose file will:
1. Start PostgreSQL and wait for it to be healthy
2. Start api-service (runs Prisma migrations automatically)
3. Start ai-service
4. Start web-ui (nginx proxies API requests to api-service)

#### Accessing Services

| Service | URL |
|---------|-----|
| Web UI | http://localhost |
| API Service | http://localhost:5000 |
| AI Service | http://localhost:8001 |
| PostgreSQL | localhost:5432 |

### Docker Compose (Development)

For development with hot-reload and volume mounts:

```bash
docker compose \
  -f infra/docker/docker-compose.yml \
  -f infra/docker/docker-compose.dev.yml \
  up
```

This overrides production settings with:
- **web-ui**: Vite dev server on port `5173` with hot-reload
- **api-service**: Nodemon with TypeScript on port `5000`
- **ai-service**: Uvicorn with `--reload` in dummy mode
- Source code mounted as volumes — changes reflect immediately

---

## Kubernetes Deployment

### Namespace Setup

```bash
# Create the namespace
kubectl create namespace tripmind
```

### Secrets Configuration

> [!CAUTION]
> The `secrets.yaml` file in the repo contains **placeholder values only**. Never commit real secrets to version control.

**Option A: Edit the secrets file directly**

```bash
# Encode your values
echo -n "your-actual-password" | base64

# Edit infra/k8s/base/secrets.yaml with your base64-encoded values
# Then apply:
kubectl apply -f infra/k8s/base/secrets.yaml -n tripmind
```

**Option B: Create secrets imperatively** (recommended for production)

```bash
kubectl create secret generic tripmind-secrets \
  --namespace=tripmind \
  --from-literal=postgres-user=tripmind \
  --from-literal=postgres-password=YOUR_SECURE_PASSWORD \
  --from-literal=database-url="postgresql://tripmind:YOUR_SECURE_PASSWORD@postgres:5432/tripmind?schema=public" \
  --from-literal=jwt-secret=YOUR_JWT_SECRET \
  --from-literal=google-client-id=YOUR_GOOGLE_CLIENT_ID \
  --from-literal=google-client-secret=YOUR_GOOGLE_CLIENT_SECRET \
  --from-literal=google-api-key=YOUR_GOOGLE_API_KEY
```

### Deploying with Kustomize

```bash
# Preview the generated manifests
kubectl kustomize infra/k8s/

# Apply all resources
kubectl apply -k infra/k8s/

# Check deployment status
kubectl get all -n tripmind

# Watch pods come up
kubectl get pods -n tripmind -w
```

### Deployment Order

Kustomize applies resources in this order:
1. `ConfigMap` + `Secret` — configuration & credentials
2. `StatefulSet` (postgres) — database with persistent storage
3. `Deployment` (api-service) — runs Prisma migrations on startup
4. `Deployment` (ai-service) — stateless AI execution
5. `Deployment` (web-ui) — static frontend
6. `Ingress` — external traffic routing

### Verifying the Deployment

```bash
# Check pod status
kubectl get pods -n tripmind

# Check service endpoints
kubectl get svc -n tripmind

# View logs for a specific service
kubectl logs -f deployment/api-service -n tripmind
kubectl logs -f deployment/ai-service -n tripmind
kubectl logs -f deployment/web-ui -n tripmind

# Check database connectivity
kubectl exec -it statefulset/postgres -n tripmind -- psql -U tripmind -d tripmind

# Port-forward to access services locally
kubectl port-forward svc/web-ui 8080:80 -n tripmind
kubectl port-forward svc/api-service 5000:5000 -n tripmind
```

### Scaling

To scale a service (the manifests default to 1 replica as configured):

```bash
# Scale api-service to 3 replicas
kubectl scale deployment/api-service --replicas=3 -n tripmind

# Scale web-ui to 2 replicas
kubectl scale deployment/web-ui --replicas=2 -n tripmind
```

> [!NOTE]
> The ai-service is stateless and safe to scale horizontally. The api-service uses WebSocket connections, so consider sticky sessions when scaling beyond 1 replica.

---

## Environment Variables Reference

### web-ui (Build-time)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | API base URL for HTTP requests | `/api/v1` |
| `VITE_SOCKET_URL` | WebSocket server URL | (empty = same origin) |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID | — |

### api-service

| Variable | Description | Default | Source |
|----------|-------------|---------|--------|
| `NODE_ENV` | Environment mode | `production` | Inline |
| `PORT` | Server listen port | `5000` | Inline |
| `DATABASE_URL` | PostgreSQL connection string | — | Secret |
| `JWT_SECRET` | JWT signing key | — | Secret |
| `JWT_EXPIRE` | JWT token expiry | `7d` | ConfigMap |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | — | Secret |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | — | Secret |
| `GOOGLE_CALLBACK_URL` | OAuth callback URL | — | ConfigMap |
| `FRONTEND_URL` | Frontend URL for CORS | — | ConfigMap |
| `AI_SERVICE_URL` | Internal URL to ai-service | `http://ai-service:8001` | Inline |

### ai-service

| Variable | Description | Default | Source |
|----------|-------------|---------|--------|
| `GOOGLE_API_KEY` | Google AI API key for Gemini | — | Secret |
| `DEFAULT_MODEL` | AI model to use | `gemini-2.0-flash` | ConfigMap |
| `AI_EXECUTION_MODE` | `actual` or `dummy` | `actual` | ConfigMap |
| `HOST` | Listen host | `0.0.0.0` | Inline |
| `PORT` | Listen port | `8001` | Inline |

### PostgreSQL

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_USER` | Database user | `tripmind` |
| `POSTGRES_PASSWORD` | Database password | — (from Secret) |
| `POSTGRES_DB` | Database name | `tripmind` |

---

## Service Details

### web-ui Dockerfile

```
Node 20 (build) → nginx 1.25 (serve)
```

- **Build stage**: Installs npm deps, runs `tsc && vite build`
- **Production stage**: Copies static assets to nginx, applies `nginx.conf`
- **nginx.conf features**:
  - SPA fallback: `try_files $uri /index.html`
  - Reverse proxy: `/api/` → `api-service:5000`
  - WebSocket proxy: `/socket.io/` → `api-service:5000`
  - Gzip compression + static asset caching (1 year)

### api-service Dockerfile

```
Node 20 (build) → Node 20 (run)
```

- **Build stage**: Installs all deps, generates Prisma client, compiles TypeScript
- **Production stage**: Installs production deps only, copies compiled JS + Prisma files
- **Entrypoint**: Runs `prisma migrate deploy` before starting the server
- Uses `dumb-init` for proper PID 1 signal handling
- Runs as non-root `nodejs` user

### ai-service Dockerfile

```
Python 3.11 slim
```

- Installs from `pyproject.toml` (FastAPI, Google ADK, uvicorn)
- Runs `uvicorn src.api.main:app`
- Runs as non-root `appuser`

---

## Troubleshooting

### Docker

| Issue | Solution |
|-------|----------|
| `api-service` fails to start | Check DATABASE_URL is correct and postgres is healthy: `docker compose logs postgres` |
| `web-ui` shows blank page | Verify VITE_* build args were set correctly during build |
| Port conflicts | Change host port mappings in docker-compose.yml (e.g., `"8080:80"`) |
| Prisma migration fails | Ensure the database is accessible. Run `docker compose exec api-service npx prisma migrate status` |
| ai-service connection refused | Verify `GOOGLE_API_KEY` is set. Check `docker compose logs ai-service` |

### Kubernetes

| Issue | Solution |
|-------|----------|
| Pods stuck in `Pending` | Check events: `kubectl describe pod <name> -n tripmind`. Common cause: insufficient resources or missing PVC StorageClass |
| Pods in `CrashLoopBackOff` | Check logs: `kubectl logs <pod> -n tripmind`. Usually a missing env var or DB connection issue |
| Secrets not found | Ensure secrets are created before deployments: `kubectl get secrets -n tripmind` |
| Ingress not working | Verify ingress controller is installed: `kubectl get pods -n ingress-nginx` |
| Database connection refused | Check postgres pod is running: `kubectl get pods -l app=postgres -n tripmind` |
| PVC stuck in `Pending` | Check if a default StorageClass exists: `kubectl get storageclass` |

### Useful Debug Commands

```bash
# Get pod events
kubectl describe pod <pod-name> -n tripmind

# Interactive shell into a pod
kubectl exec -it <pod-name> -n tripmind -- sh

# Check resource usage
kubectl top pods -n tripmind

# Restart a deployment
kubectl rollout restart deployment/<name> -n tripmind

# View Prisma migration status
kubectl exec -it deployment/api-service -n tripmind -- npx prisma migrate status
```
