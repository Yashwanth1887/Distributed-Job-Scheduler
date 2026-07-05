# Distributed Job Scheduler

Simple backend project for internship assignment using Node.js, Express.js and MySQL.

## Setup

1. Install dependencies

```bash
cd backend
npm install
```

2. Create `.env`

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=distributed_job_scheduler
JWT_SECRET=your_secret
```

3. Start server

```bash
npm run dev
```

## Main Modules

- Authentication
- Projects
- Queues
- Jobs
- Workers
- Retry handling
- Scheduler
- Dashboard APIs

## API List

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### Projects

- `POST /api/projects`
- `GET /api/projects`

### Queues

- `POST /api/queues`
- `GET /api/queues`
- `PUT /api/queues/:id/pause`
- `PUT /api/queues/:id/resume`
- `GET /api/queues/:id/statistics`

### Jobs

- `POST /api/jobs`
- `GET /api/jobs`

### Workers

- `POST /api/workers`
- `GET /api/workers`
- `PUT /api/workers/heartbeat`

### Retry

- `GET /api/retry/delay`

### Dashboard

- `GET /api/dashboard/queue-health`
- `GET /api/dashboard/worker-status`
- `GET /api/dashboard/job-explorer`
- `GET /api/dashboard/execution-logs`
- `GET /api/dashboard/system-metrics`

## Job Types

- Immediate job: send only `queue_id` and `job_name`
- Delayed job: send `scheduled_time`
- Scheduled job: send `scheduled_time`
- Recurring job: send `cron_expression`
- Batch job: send `jobs` array

## Testing Guide

Use Thunder Client with `Authorization: Bearer <token>` for protected routes.

### Example job body

```json
{
  "queue_id": 1,
  "job_name": "Sample Job",
  "payload": { "message": "hello" },
  "priority": 1
}
```

### Example batch body

```json
{
  "jobs": [
    {
      "queue_id": 1,
      "job_name": "Job 1",
      "payload": { "x": 1 }
    },
    {
      "queue_id": 1,
      "job_name": "Job 2",
      "payload": { "x": 2 }
    }
  ]
}
```

## Architecture

- `routes/` for API endpoints
- `controllers/` for request handling
- `services/` for background logic
- `middleware/` for auth check
- `config/` for database connection

## Design Decisions

- Kept SQL direct and readable
- Used existing tables only
- Kept controller logic small
- Used simple job state flow
- Kept background worker logic inside service file
