from pydantic import BaseModel
from enum import Enum
from typing import Optional, Any


class XmlFileMetaModel(BaseModel):
    url: str
    schemaType: str


class TaskIdModel(BaseModel):
    task_id: str
    

class ResultStatusE(str, Enum):
    PENDING = "PENDING" # (waiting for execution or unknown task id)
    STARTED = "STARTED" # (task has been started)
    SUCCESS = "SUCCESS" # (task executed successfully)
    FAILURE = "FAILURE" # (task execution resulted in exception)
    RETRY = "RETRY"     # (task is being retried)
    REVOKED = "REVOKED" # (task has been revoked)
    
    
class TaskResultModel(BaseModel):
    status: ResultStatusE
    result: Optional[Any] = None
    
    
class XmlValidationResult(BaseModel):
    valid: bool
    msg: Optional[str] = None


