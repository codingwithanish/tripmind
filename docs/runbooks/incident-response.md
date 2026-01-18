# Incident Response

Guide for handling production incidents.

## Severity Levels

| Level | Description | Response Time | Examples |
|-------|-------------|---------------|----------|
| **P1** | Critical - Service down | Immediate | Complete outage, data loss |
| **P2** | High - Major feature broken | 1 hour | Auth failure, payments broken |
| **P3** | Medium - Feature degraded | 4 hours | Slow performance, minor bugs |
| **P4** | Low - Minor issue | 24 hours | UI glitch, typos |

## Incident Workflow

### 1. Detection

- Monitor alerts (if configured)
- User reports
- Health check failures

### 2. Triage

1. Identify affected services
2. Determine severity level
3. Notify stakeholders if P1/P2

### 3. Investigation

```bash
# Check pod status
kubectl get pods -n tripmind

# View recent logs
kubectl logs -f deployment/api-service -n tripmind --since=1h

# Check resource usage
kubectl top pods -n tripmind
```

### 4. Mitigation

Common actions:
- **Restart service**: `kubectl rollout restart deployment/api-service`
- **Scale up**: `kubectl scale deployment/api-service --replicas=3`
- **Rollback**: `kubectl rollout undo deployment/api-service`

### 5. Resolution

1. Apply fix
2. Verify fix in production
3. Monitor for recurrence

### 6. Post-Mortem

Document:
- What happened
- Timeline of events
- Root cause
- Actions to prevent recurrence

## Useful Commands

```bash
# Get recent events
kubectl get events -n tripmind --sort-by='.lastTimestamp'

# Describe failing pod
kubectl describe pod <pod-name> -n tripmind

# Execute into container
kubectl exec -it <pod-name> -n tripmind -- /bin/sh

# Check ingress
kubectl get ingress -n tripmind
```

## Contacts

| Role | Contact |
|------|---------|
| On-call Engineer | TBD |
| Tech Lead | TBD |
| DevOps | TBD |
