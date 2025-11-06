from celery.result import AsyncResult
from fastapi import FastAPI, Body, Path
from .models import TaskIdModel, TaskResultModel, XmlFileMetaModel, ResultStatusE
from .tasks import task_xml_validate
from fastapi.middleware.cors import CORSMiddleware

import shapefile
import os
import json
import requests
import zipfile
import io



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


class UnsupportedGeometryType(Exception):
    def __init__(self, geom_type):
        self.geom_type=geom_type
        self.message = f"{geom_type} geometry type is not supported"
        super().__init__(self.message)

@app.get("/atom")
def shp_to_geojson(atom_url):
    geom_type={0: 'NULL',
     1: 'POINT',
     3: 'LINE',
     5: 'POLYGON',
     8: 'MULTIPOINT',
     11: 'POINT',
     13: 'LINE',
     15: 'POLYGON',
     18: 'MULTIPOINT',
     21: 'POINT',
     23: 'LINE',
     25: 'POLYGON',
     28: 'MULTIPOINT',
     31: 'MULTIPATCH'}

    zip_files = zipfile.ZipFile(io.BytesIO(requests.get(atom_url, allow_redirects=True).content))
    file_names_shp=set([i.filename[:-4] for i in zip_files.filelist])

    results=[]

    for shp in file_names_shp:

        geojson={"type":"FeatureCollection","name":os.path.basename(shp),
                 "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:EPSG::3857" } }}

        try:
            sf = shapefile.Reader(shp=io.BytesIO(zip_files.read(shp+'.shp')), dbf=io.BytesIO(zip_files.read(shp+'.dbf')))
        except KeyError:
            continue
        geometry_type=geom_type[sf.shapeType]
        field_names = [field[0] for field in sf.fields[1:]]

        if geometry_type == 'POINT':
            geojson["features"]=[{ "type": "Feature", "properties": dict(zip(field_names, i.record)), "geometry":  i.shape.__geo_interface__  } for i in sf.shapeRecords()]
        elif geometry_type in ['MULTIPOINT', 'LINE', 'POLYGON']:
            zamiana_geom={'Point':'MultiPoint', 'MultiPoint':'MultiPoint', 'MultiLineString':'MultiLineString','LineString':'MultiLineString', 'Polygon':'MultiPolygon','MultiPolygon':'MultiPolygon'}
            geom_list=[]
            for i in sf.shapeRecords():
                geo_temp=i.shape.__geo_interface__
                if geo_temp['type'] in ['Point', 'LineString', 'Polygon']:
                    geom_list.append({"type": "Feature", "properties": dict(zip(field_names, i.record)), "geometry":{'type': zamiana_geom[geo_temp['type']], 'coordinates':[i.shape.__geo_interface__['coordinates']]}})
                else:
                    geom_list.append({"type": "Feature", "properties": dict(zip(field_names, i.record)), "geometry": {'type': zamiana_geom[geo_temp['type']],'coordinates': i.shape.__geo_interface__['coordinates']}})
            geojson["features"]=geom_list
        else:
            raise UnsupportedGeometryType(geometry_type)

        results.append(json.dumps(geojson))
        
    return results