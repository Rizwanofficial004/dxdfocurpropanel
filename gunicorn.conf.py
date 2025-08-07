# Gunicorn Configuration for DDS Focus Time API
# Save this as gunicorn.conf.py in your Django project root

import os
import multiprocessing

# Server socket
bind = "0.0.0.0:8000"
backlog = 2048

# Worker processes
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
worker_connections = 1000
timeout = 300
keepalive = 2

# Restart workers after this many requests, to prevent memory leaks
max_requests = 1000
max_requests_jitter = 50

# Logging
accesslog = "/var/log/gunicorn/access.log"
errorlog = "/var/log/gunicorn/error.log"
loglevel = "info"
capture_output = True

# Process naming
proc_name = "dxdtime-api"

# Daemonize the Gunicorn process (detach & run in the background)
daemon = False

# The socket to bind to
user = "www-data"
group = "www-data"

# SSL (if terminating SSL at Gunicorn level)
# keyfile = "/path/to/private.key"
# certfile = "/path/to/certificate.crt"

# Environment variables
raw_env = [
    "DJANGO_SETTINGS_MODULE=DDS.settings",
]

# Preload application for better performance
preload_app = True

# Maximum request header size
limit_request_line = 4096
limit_request_fields = 100
limit_request_field_size = 8190

# Disable access log for health checks
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

def when_ready(server):
    server.log.info("Server is ready. Spawning workers")

def worker_int(worker):
    worker.log.info("worker received INT or QUIT signal")

def pre_fork(server, worker):
    server.log.info("Worker spawned (pid: %s)", worker.pid)

def post_fork(server, worker):
    server.log.info("Worker spawned (pid: %s)", worker.pid)

def post_worker_init(worker):
    worker.log.info("Worker initialized (pid: %s)", worker.pid)

def worker_abort(worker):
    worker.log.info("Worker aborted (pid: %s)", worker.pid)
