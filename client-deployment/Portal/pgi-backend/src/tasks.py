import requests
from typing import Dict
from celery import Task
from celery.utils.log import get_task_logger
from xmlschema import validate, XMLSchemaValidationError, XMLSchema10, XMLSchemaParseError, XMLSchema11, XMLSchemaBase
from xmlschema.exceptions import XMLSchemaValueError
from . import celery_app
from .models import XmlFileMetaModel, XmlValidationResult, SchemaType


logger = get_task_logger(__name__)


csw_get_records = """<?xml version="1.0"?>
<csw:GetRecords xmlns:csw="http://www.opengis.net/cat/csw/2.0.2"
                xmlns:gmd="http://www.isotc211.org/2005/gmd"
                service="CSW"
                maxRecords="3"
                startPosition="1"
                version="2.0.2"
                resultType="results"
                outputSchema="http://www.isotc211.org/2005/gmd">
	<csw:Query typeNames="gmd:MD_Metadata">
		<csw:ElementName>/gmd:MD_Metadata/gmd:fileIdentifier</csw:ElementName>
		<csw:ElementName>
      /gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:citation/gmd:CI_Citation/gmd:title
    </csw:ElementName>
		<csw:Constraint version="1.1.0">
			<Filter xmlns="http://www.opengis.net/ogc">
				<PropertyIsLike wildCard="%"
				                singleChar="_"
				                escapeChar="\">
					<PropertyName>any</PropertyName>
					<Literal/>
				</PropertyIsLike>
			</Filter>
		</csw:Constraint>
	</csw:Query>
</csw:GetRecords>"""


class XmlValidateBase(Task):    
    
    abstract = True
    schema_type_mapping: Dict[SchemaType, XMLSchemaBase]
    
    
    def __init__(self):
        super().__init__()
        self.schema_type_mapping = None

    def __call__(self, *args, **kwargs):
        if self.schema_type_mapping is None:
            # multiprocessing safe loading
            self.schema_type_mapping = {
                SchemaType.Atom: XMLSchema11("https://inspire-geoportal.ec.europa.eu/schemas/inspire/atom/1.0/atom.xsd", validation="skip"),
                SchemaType.OpenSearch: XMLSchema11("https://inspire-geoportal.ec.europa.eu/schemas/inspire/atom/1.0/opensearch.xsd", validation="skip"),
                SchemaType.CswGetRecord: XMLSchema10(csw_get_records, validation="skip"),
                SchemaType.Builtin: None
            }
        return self.run(*args, **kwargs)
    
    
@celery_app.task(
    name="xml_validate", 
    bind=True, 
    base=XmlValidateBase
)
def task_xml_validate(self, xml_meta: XmlFileMetaModel) -> XmlValidationResult:
    # update task status
    self.update_state(state='STARTED')
    logger.info(f"Received schema type: {xml_meta.schemaType} and url: {xml_meta.url}")
    # download xml
    xml_document = requests.get(xml_meta.url).text
    # validate
    try:
        validate(
            xml_document=xml_document,
            schema=self.schema_type_mapping[xml_meta.schemaType]
        )
        return XmlValidationResult(
            valid=True
        )
    except XMLSchemaValidationError as e:
        return XmlValidationResult(
            valid=False,
            msg=str(e.reason)
        )
    except XMLSchemaValueError as e:
        return XmlValidationResult(
            valid=False,
            msg=str(e)
        )
    except XMLSchemaParseError as e:
        return XmlValidationResult(
            valid=False,
            msg=str(e)
        )