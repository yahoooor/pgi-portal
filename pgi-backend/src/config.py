import logging
from pydantic import BaseSettings
from typing import List
from enum import IntEnum


class LogLevel(IntEnum):
    DEBUG = logging.DEBUG
    INFO = logging.INFO
    WARNING = logging.WARNING
    ERROR = logging.ERROR
    CRITICAL = logging.CRITICAL
    
    
    
class AppConfig(BaseSettings):
    
    # common
    log_level: LogLevel = LogLevel.INFO
    celery_broker_url: str = "pyamqp://guest:guest@localhost:5672"
    celery_backend_url: str = "redis://localhost:6379/0"
    result_serializer: str = "pickle"
    task_serializer: str = "pickle"
    accept_content: List[str] = ["pickle", "json"]
    celery_uid: str = "0"
    celery_gid: str = "0"
    
    # restapi
    rest_host: str = "0.0.0.0"
    rest_port: int = 5000
    rest_workers: int = 1
    
    # celery workers
    celery_workers: int = 1
    imports: List[str] = ["src.tasks"]
    broker_heartbeat: int = 120
    celery_consume_queues: List[str] = ["celery"]