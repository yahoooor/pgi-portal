import uvicorn
from typer import Typer
from enum import Enum


typer_app = Typer()


class AppName(str, Enum):
    RestApi = "RestApi"
    Workers = "Workers"
    

@typer_app.command(name="run")
def run_app(app_name: AppName):
    if app_name == AppName.RestApi:
        from src import app_config
        uvicorn.run(
            "src.api:app",
            port=app_config.rest_port,
            host=app_config.rest_host,
            workers=app_config.rest_workers,
            log_level=app_config.log_level
        )
    elif app_name == AppName.Workers:
        from src import celery_app, app_config
        from src.config import LogLevel
        celery_log_level = {
            LogLevel.DEBUG: "DEBUG", 
            LogLevel.INFO: "INFO", 
            LogLevel.WARNING: "WARNING", 
            LogLevel.ERROR: "ERROR", 
            LogLevel.CRITICAL: "CRITICAL"    
        }[app_config.log_level]
        celery_app.worker_main([
            "worker",
            f"--loglevel={celery_log_level}",
            f"--concurrency={app_config.celery_workers}",
            f"-n{app_name}",
            f"-Q{','.join(app_config.celery_consume_queues)}",
            f"--uid={app_config.celery_uid}",
            f"--gid={app_config.celery_gid}", 
        ]) 
        

if __name__ == "__main__":
    typer_app()