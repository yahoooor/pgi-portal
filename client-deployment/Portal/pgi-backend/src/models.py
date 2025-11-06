from pydantic import BaseModel
from enum import Enum
from typing import Optional, Any


class SchemaType(str, Enum):
    Atom = "atom"
    OpenSearch = "openSearch"
    CswGetRecord = "cswGetRecord"
    Builtin = ""


class XmlFileMetaModel(BaseModel):
    url: str
    schemaType: SchemaType = SchemaType.Builtin
    
    
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

