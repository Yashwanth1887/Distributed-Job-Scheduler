# API Documentation

## Auth

### POST /api/auth/register

### POST /api/auth/login

## Projects

### POST /api/projects
Protected route.

### GET /api/projects
Protected route.

## Queues

### POST /api/queues
Create queue.

### GET /api/queues
List queues.

### PUT /api/queues/:id/pause
Pause queue.

### PUT /api/queues/:id/resume
Resume queue.

### GET /api/queues/:id/statistics
Queue stats using aggregate query.

## Jobs

### POST /api/jobs
Create immediate, delayed, scheduled, recurring or batch job.

### GET /api/jobs
List jobs.

## Workers

### POST /api/workers
Register worker.

### GET /api/workers
List workers.

### PUT /api/workers/heartbeat
Update worker heartbeat.

## Retry

### GET /api/retry/delay
Return calculated retry delay.

## Dashboard

### GET /api/dashboard/queue-health
### GET /api/dashboard/worker-status
### GET /api/dashboard/job-explorer
### GET /api/dashboard/execution-logs
### GET /api/dashboard/system-metrics
