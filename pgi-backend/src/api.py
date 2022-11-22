from celery.result import AsyncResult
from fastapi import FastAPI, Body, Path
from .models import TaskIdModel, TaskResultModel, XmlFileMetaModel, ResultStatusE
from .tasks import task_xml_validate
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post(
    "/xml/validate",
    response_model=TaskIdModel
)
def xml_validate(
            xml_meta: XmlFileMetaModel = Body()
        ) -> TaskIdModel:
    async_result: AsyncResult = task_xml_validate.delay(xml_meta)
    return TaskIdModel(task_id=async_result.id)


@app.get(
    "/xml/result/{task_id}"
)
def xml_validate_result(
            task_id: str = Path()
        ) -> TaskResultModel:
    async_result: AsyncResult = task_xml_validate.AsyncResult(task_id=task_id)
    
    if async_result.status == ResultStatusE.SUCCESS:
        return TaskResultModel(status=async_result.status, result=async_result.result)
    return TaskResultModel(status=async_result.status)


@app.delete(
    "/xml/{task_id}"
)
def xml_delete(
            task_id: str = Path()
        ):
    async_result: AsyncResult = task_xml_validate.AsyncResult(task_id=task_id)
    async_result.revoke(terminate=True)


