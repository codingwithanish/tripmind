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
   - [Quick Deploy (Single Command)](#quick-deploy-single-command)
   - [Hetzner Cloud Storage Setup](#hetzner-cloud-storage-setup)
   - [Secrets Configuration](#secrets-configuration)
   - [Deploying with Kustomize](#deploying-with-kustomize)
   - [Verifying the Deployment](#verifying-the-deployment)
   - [Scaling](#scaling)
6. [Environment Variables Reference](#environment-variables-reference)
7. [Service Details](#service-details)
8. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      Ingress (nginx)                    │
│              travelrekha.com  │  api.travelrekha.com          │
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
| **web-ui** | React, Vite, nginx | 80 | `travelrekha/web-ui` |
| **api-service** | Express, TypeScript, Prisma | 5000 | `travelrekha/api-service` |
| **ai-service** | FastAPI, Google ADK, Python 3.11 | 8001 | `travelrekha/ai-service` |
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
travelrekha/
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
docker build -t travelrekha/web-ui:latest ./apps/web-ui

# Build api-service
docker build -t travelrekha/api-service:latest ./services/api-service

# Build ai-service
docker build -t travelrekha/ai-service:latest ./services/ai-service
```

#### Build Arguments (web-ui)

The web-ui Dockerfile supports build-time arguments for Vite environment variables:

```bash
docker build \
  --build-arg VITE_API_BASE_URL=https://api.travelrekha.com/api/v1 \
  --build-arg VITE_SOCKET_URL=https://api.travelrekha.com \
  --build-arg VITE_GOOGLE_CLIENT_ID=your-google-client-id \
  -t travelrekha/web-ui:latest ./apps/web-ui
```

> [!IMPORTANT]
> Vite injects environment variables at **build time**, not runtime. You must rebuild the image when changing `VITE_*` variables.

### Pushing Images to a Container Registry

After building images locally, you need to push them to a centralized container registry so that Kubernetes nodes (or other deployment targets) can pull them.

#### Image Tagging Convention

Use semantic versioning alongside `latest`:

```bash
# Tag with version and latest
docker tag travelrekha/web-ui:latest       <REGISTRY>/travelrekha/web-ui:1.0.0
docker tag travelrekha/web-ui:latest       <REGISTRY>/travelrekha/web-ui:latest
docker tag travelrekha/api-service:latest  <REGISTRY>/travelrekha/api-service:1.0.0
docker tag travelrekha/api-service:latest  <REGISTRY>/travelrekha/api-service:latest
docker tag travelrekha/ai-service:latest   <REGISTRY>/travelrekha/ai-service:1.0.0
docker tag travelrekha/ai-service:latest   <REGISTRY>/travelrekha/ai-service:latest
```

> [!TIP]
> For CI/CD, also tag with the Git commit SHA for traceability:
> `docker tag travelrekha/web-ui:latest <REGISTRY>/travelrekha/web-ui:$(git rev-parse --short HEAD)`

---

#### Option A: Docker Hub

The simplest option for public/private images.

```bash
# 1. Login to Docker Hub
docker login-*

# 2. Tag images (replace "yourusername" with your Docker Hub username)
docker tag travelrekha/web-ui:latest       anishantony/travelrekha-web-ui:latest
docker tag travelrekha/web-ui:latest       anishantony/travelrekha-web-ui:1.0.0
docker tag travelrekha/api-service:latest  anishantony/travelrekha-api-service:latest
docker tag travelrekha/api-service:latest  anishantony/travelrekha-api-service:1.0.0
docker tag travelrekha/ai-service:latest   anishantony/travelrekha-ai-service:latest
docker tag travelrekha/ai-service:latest   anishantony/travelrekha-ai-service:1.0.0

# 3. Push all images
docker push anishantony/travelrekha-web-ui:latest
docker push anishantony/travelrekha-web-ui:1.0.0
docker push anishantony/travelrekha-api-service:latest
docker push anishantony/travelrekha-api-service:1.0.0
docker push anishantony/travelrekha-ai-service:latest
docker push anishantony/travelrekha-ai-service:1.0.0

# 4. Verify on Docker Hub
#    Visit https://hub.docker.com/r/yourusername/travelrekha-web-ui
```

For private repos, create a Kubernetes pull secret:

```bash
kubectl create secret docker-registry dockerhub-creds \
  --namespace=travelrekha \
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
aws ecr create-repository --repository-name travelrekha/web-ui
aws ecr create-repository --repository-name travelrekha/api-service
aws ecr create-repository --repository-name travelrekha/ai-service

# 2. Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  123456789012.dkr.ecr.us-east-1.amazonaws.com

# 3. Tag images
export ECR_REGISTRY=123456789012.dkr.ecr.us-east-1.amazonaws.com
docker tag travelrekha/web-ui:latest       $ECR_REGISTRY/travelrekha/web-ui:latest
docker tag travelrekha/web-ui:latest       $ECR_REGISTRY/travelrekha/web-ui:1.0.0
docker tag travelrekha/api-service:latest  $ECR_REGISTRY/travelrekha/api-service:latest
docker tag travelrekha/api-service:latest  $ECR_REGISTRY/travelrekha/api-service:1.0.0
docker tag travelrekha/ai-service:latest   $ECR_REGISTRY/travelrekha/ai-service:latest
docker tag travelrekha/ai-service:latest   $ECR_REGISTRY/travelrekha/ai-service:1.0.0

# 4. Push all images
docker push $ECR_REGISTRY/travelrekha/web-ui:latest
docker push $ECR_REGISTRY/travelrekha/web-ui:1.0.0
docker push $ECR_REGISTRY/travelrekha/api-service:latest
docker push $ECR_REGISTRY/travelrekha/api-service:1.0.0
docker push $ECR_REGISTRY/travelrekha/ai-service:latest
docker push $ECR_REGISTRY/travelrekha/ai-service:1.0.0

# 5. Verify
aws ecr describe-images --repository-name travelrekha/web-ui
```

> [!NOTE]
> ECR login tokens expire after **12 hours**. For EKS clusters, IAM roles handle authentication automatically.

---

#### Option C: Google Cloud Artifact Registry (GCP)

Best for deployments on GKE.

```bash
# 1. Create repository (one-time setup)
gcloud artifacts repositories create travelrekha \
  --repository-format=docker \
  --location=us-central1 \
  --description="TripMind Docker images"

# 2. Configure Docker authentication
gcloud auth configure-docker us-central1-docker.pkg.dev

# 3. Tag images
export GAR_REGISTRY=us-central1-docker.pkg.dev/YOUR_PROJECT_ID/travelrekha
docker tag travelrekha/web-ui:latest       $GAR_REGISTRY/web-ui:latest
docker tag travelrekha/web-ui:latest       $GAR_REGISTRY/web-ui:1.0.0
docker tag travelrekha/api-service:latest  $GAR_REGISTRY/api-service:latest
docker tag travelrekha/api-service:latest  $GAR_REGISTRY/api-service:1.0.0
docker tag travelrekha/ai-service:latest   $GAR_REGISTRY/ai-service:latest
docker tag travelrekha/ai-service:latest   $GAR_REGISTRY/ai-service:1.0.0

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
    image: us-central1-docker.pkg.dev/my-project/travelrekha/api-service:1.0.0
    #                                ↑ replace with your actual registry path
```

Or use `kustomize` image overrides without modifying base manifests:

```yaml
# infra/k8s/kustomization.yaml
images:
  - name: travelrekha/web-ui
    newName: us-central1-docker.pkg.dev/my-project/travelrekha/web-ui
    newTag: "1.0.0"
  - name: travelrekha/api-service
    newName: us-central1-docker.pkg.dev/my-project/travelrekha/api-service
    newTag: "1.0.0"
  - name: travelrekha/ai-service
    newName: us-central1-docker.pkg.dev/my-project/travelrekha/ai-service
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
./scripts/push-images.sh yourusername/travelrekha 1.0.0

# AWS ECR
./scripts/push-images.sh 123456789012.dkr.ecr.us-east-1.amazonaws.com/travelrekha 1.0.0

# GCP Artifact Registry
./scripts/push-images.sh us-central1-docker.pkg.dev/my-project/travelrekha 1.0.0
```

### Docker Compose (Production)

Start all services with a single command:

```bash
# Navigate to project root
cd travelrekha

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

### Quick Deploy (Single Command)

The entire stack — namespace, storage, secrets, database, all services, and ingress — can be deployed with a **single Kustomize command**:

```bash
# Deploy everything at once
kubectl apply -k infra/k8s/
```

This single command reads `infra/k8s/kustomization.yaml` and applies all resources in the correct dependency order:

| Order | Resource | File |
|-------|----------|------|
| 1 | Namespace (`travelrekha`) | `base/namespace.yaml` |
| 2 | StorageClass (Hetzner CSI) | `base/storageclass.yaml` |
| 3 | PersistentVolumeClaim | `base/postgres-pvc.yaml` |
| 4 | ConfigMap | `base/configmap.yaml` |
| 5 | Secrets | `base/secrets.yaml` |
| 6 | PostgreSQL (StatefulSet + Service) | `base/postgres.yaml` |
| 7 | API Service (Deployment + Service) | `base/api-service.yaml` |
| 8 | AI Service (Deployment + Service) | `base/ai-service.yaml` |
| 9 | Web UI (Deployment + Service) | `base/web-ui.yaml` |
| 10 | Ingress | `base/ingress.yaml` |

Kustomize also automatically applies the `travelrekha` namespace and common labels to all resources.

> [!IMPORTANT]
> Before running the deploy command, make sure you have:
> 1. Updated `infra/k8s/base/secrets.yaml` with your real base64-encoded secrets (see [Secrets Configuration](#secrets-configuration))
> 2. Set up the Hetzner CSI driver if deploying on Hetzner Cloud (see [Hetzner Cloud Storage Setup](#hetzner-cloud-storage-setup))

#### Other Useful Kustomize Commands

```bash
# Preview the generated manifests (dry-run, nothing is applied)
kubectl kustomize infra/k8s/

# Delete all resources managed by this kustomization
kubectl delete -k infra/k8s/

# Re-apply after making changes (Kustomize is idempotent)
kubectl apply -k infra/k8s/

# Watch pods come up after deploy
kubectl get pods -n travelrekha -w

# Check all resources in the namespace
kubectl get all -n travelrekha
```

> [!TIP]
> You do **not** need to manually create the namespace — it is included in `base/namespace.yaml` and deployed as part of the Kustomize command.

---

### Hetzner Cloud Storage Setup

If deploying on Hetzner Cloud, you need to set up the CSI driver **before** running the deploy command to support persistent volumes.

1. **Create API Token**:
   - Go to Hetzner Cloud Console → Security → API Tokens.
   - Create a token with Read & Write permissions.

2. **Create Secret**:
   ```bash
   kubectl -n kube-system create secret generic hcloud --from-literal=token=<YOUR-TOKEN>
   ```

3. **Install CSI Driver**:
   ```bash
   kubectl apply -f https://raw.githubusercontent.com/hetznercloud/csi-driver/main/deploy/kubernetes/hcloud-csi.yml
   ```

4. **Verify CSI Driver**:
   ```bash
   kubectl get pods -n kube-system -l app=hcloud-csi
   kubectl get storageclass
   ```

---

### Secrets Configuration

> [!CAUTION]
> The `secrets.yaml` file in the repo contains **placeholder values only**. Never commit real secrets to version control.

**Option A: Edit the secrets file directly** (applied via Kustomize)

```bash
# Encode your values
echo -n "your-actual-password" | base64

# Edit infra/k8s/base/secrets.yaml with your base64-encoded values
# The secrets will be applied automatically when you run:
kubectl apply -k infra/k8s/
```

**Option B: Create secrets imperatively** (recommended for production)

If you prefer not to store secrets in YAML files, create them imperatively first, then deploy:

```bash
# 1. Create the namespace first
kubectl apply -f infra/k8s/base/namespace.yaml

# 2. Create secrets imperatively
kubectl create secret generic travelrekha-secrets \
  --namespace=travelrekha \
  --from-literal=postgres-user=travelrekha \
  --from-literal=postgres-password=YOUR_SECURE_PASSWORD \
  --from-literal=database-url="postgresql://travelrekha:YOUR_SECURE_PASSWORD@postgres:5432/travelrekha?schema=public" \
  --from-literal=jwt-secret=YOUR_JWT_SECRET \
  --from-literal=google-client-id=YOUR_GOOGLE_CLIENT_ID \
  --from-literal=google-client-secret=YOUR_GOOGLE_CLIENT_SECRET \
  --from-literal=google-api-key=YOUR_GOOGLE_API_KEY

# 3. Deploy everything (secrets.yaml will be skipped since it already exists)
kubectl apply -k infra/k8s/
```

---

### Deploying with Kustomize

The `kustomization.yaml` is the single source of truth for all K8s resources. It manages:
- **Namespace**: All resources are placed in the `travelrekha` namespace
- **Common Labels**: `app.kubernetes.io/name: tripmind` and `app.kubernetes.io/managed-by: kustomize`
- **Resources**: All YAML manifests listed in the correct dependency order

### Verifying the Deployment

```bash
# Check pod status
kubectl get pods -n travelrekha

# Check service endpoints
kubectl get svc -n travelrekha

# View logs for a specific service
kubectl logs -f deployment/api-service -n travelrekha
kubectl logs -f deployment/ai-service -n travelrekha
kubectl logs -f deployment/web-ui -n travelrekha

# Check database connectivity
kubectl exec -it statefulset/postgres -n travelrekha -- psql -U travelrekha -d travelrekha

# Port-forward to access services locally
kubectl port-forward svc/web-ui 8080:80 -n travelrekha
kubectl port-forward svc/api-service 5000:5000 -n travelrekha
```

### Scaling

To scale a service (the manifests default to 1 replica as configured):

```bash
# Scale api-service to 3 replicas
kubectl scale deployment/api-service --replicas=3 -n travelrekha

# Scale web-ui to 2 replicas
kubectl scale deployment/web-ui --replicas=2 -n travelrekha
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
| `POSTGRES_USER` | Database user | `travelrekha` |
| `POSTGRES_PASSWORD` | Database password | — (from Secret) |
| `POSTGRES_DB` | Database name | `travelrekha` |

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
| Pods stuck in `Pending` | Check events: `kubectl describe pod <name> -n travelrekha`. Common cause: insufficient resources or missing PVC StorageClass |
| Pods in `CrashLoopBackOff` | Check logs: `kubectl logs <pod> -n travelrekha`. Usually a missing env var or DB connection issue |
| Secrets not found | Ensure secrets are created before deployments: `kubectl get secrets -n travelrekha` |
| Ingress not working | Verify ingress controller is installed: `kubectl get pods -n ingress-nginx` |
| Database connection refused | Check postgres pod is running: `kubectl get pods -l app=postgres -n travelrekha` |
| PVC stuck in `Pending` | Check if a default StorageClass exists: `kubectl get storageclass` |

### Useful Debug Commands

```bash
# Get pod events
kubectl describe pod <pod-name> -n travelrekha

# Interactive shell into a pod
kubectl exec -it <pod-name> -n travelrekha -- sh

# Check resource usage
kubectl top pods -n travelrekha

# Restart a deployment
kubectl rollout restart deployment/<name> -n travelrekha

# View Prisma migration status
kubectl exec -it deployment/api-service -n travelrekha -- npx prisma migrate status
```
