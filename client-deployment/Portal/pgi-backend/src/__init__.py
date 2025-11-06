from celery import Celery
from .config import AppConfig


app_config = AppConfig()


celery_app = Celery(
    broker=app_config.celery_broker_url, 
    backend=app_config.celery_backend_url
)
celery_app.conf.update(
    task_serializer=app_config.task_serializer,
    result_serializer=app_config.result_serializer,
    accept_content=app_config.accept_content,
    broker_heartbeat=app_config.broker_heartbeat,
    imports=app_config.imports,
    worker_send_task_events=True,
    task_ignore_result=False,
)