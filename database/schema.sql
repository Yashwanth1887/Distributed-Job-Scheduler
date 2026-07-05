CREATE TABLE organizations (
    organization_id INT AUTO_INCREMENT PRIMARY KEY,
    organization_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    organization_id INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (organization_id)
    REFERENCES organizations(organization_id)
    ON DELETE CASCADE
);

CREATE TABLE projects (
    project_id INT AUTO_INCREMENT PRIMARY KEY,
    organization_id INT NOT NULL,
    project_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_project_organization
        FOREIGN KEY (organization_id)
        REFERENCES organizations(organization_id)
        ON DELETE CASCADE,

    INDEX idx_project_org (organization_id)
);

CREATE TABLE retry_policies (
    retry_policy_id INT AUTO_INCREMENT PRIMARY KEY,
    retry_type ENUM('FIXED','LINEAR','EXPONENTIAL') NOT NULL,
    max_retries INT NOT NULL DEFAULT 3,
    retry_delay INT NOT NULL DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE queues (
    queue_id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    retry_policy_id INT NOT NULL,
    queue_name VARCHAR(100) NOT NULL,
    priority INT DEFAULT 1,
    concurrency_limit INT DEFAULT 1,
    status ENUM('ACTIVE','PAUSED') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_queue_project
        FOREIGN KEY (project_id)
        REFERENCES projects(project_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_queue_retry
        FOREIGN KEY (retry_policy_id)
        REFERENCES retry_policies(retry_policy_id),

    INDEX idx_queue_project (project_id),
    INDEX idx_queue_status (status)
);

CREATE TABLE workers (
    worker_id INT AUTO_INCREMENT PRIMARY KEY,
    worker_name VARCHAR(100) NOT NULL,
    status ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE worker_heartbeats (
    heartbeat_id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id INT NOT NULL,
    last_heartbeat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_heartbeat_worker
        FOREIGN KEY (worker_id)
        REFERENCES workers(worker_id)
        ON DELETE CASCADE,

    INDEX idx_heartbeat_worker (worker_id)
);


CREATE TABLE jobs (
    job_id INT AUTO_INCREMENT PRIMARY KEY,
    queue_id INT NOT NULL,
    job_name VARCHAR(150) NOT NULL,
    payload JSON,
    status ENUM(
        'QUEUED',
        'SCHEDULED',
        'CLAIMED',
        'RUNNING',
        'COMPLETED',
        'FAILED'
    ) DEFAULT 'QUEUED',

    priority INT DEFAULT 1,

    retry_count INT DEFAULT 0,

    worker_id INT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_job_queue
        FOREIGN KEY (queue_id)
        REFERENCES queues(queue_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_job_worker
        FOREIGN KEY (worker_id)
        REFERENCES workers(worker_id)
        ON DELETE SET NULL,

    INDEX idx_job_status (status),
    INDEX idx_job_queue (queue_id)
);


CREATE TABLE scheduled_jobs (
    scheduled_job_id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    scheduled_time DATETIME,
    cron_expression VARCHAR(100),

    CONSTRAINT fk_schedule_job
        FOREIGN KEY (job_id)
        REFERENCES jobs(job_id)
        ON DELETE CASCADE
);

CREATE TABLE job_executions (
    execution_id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    worker_id INT NOT NULL,

    started_at DATETIME,

    finished_at DATETIME,

    execution_status ENUM(
        'RUNNING',
        'SUCCESS',
        'FAILED'
    ),

    execution_time_ms INT,

    CONSTRAINT fk_execution_job
        FOREIGN KEY (job_id)
        REFERENCES jobs(job_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_execution_worker
        FOREIGN KEY (worker_id)
        REFERENCES workers(worker_id)
);

CREATE TABLE job_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    execution_id INT NOT NULL,
    log_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_log_execution
        FOREIGN KEY (execution_id)
        REFERENCES job_executions(execution_id)
        ON DELETE CASCADE
);


CREATE TABLE dead_letter_queue (
    dlq_id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    failed_reason TEXT,
    moved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_dlq_job
        FOREIGN KEY (job_id)
        REFERENCES jobs(job_id)
        ON DELETE CASCADE
);