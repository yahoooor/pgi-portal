import requests
from celery.utils.log import get_task_logger
from xmlschema import validate, XMLSchemaValidationError, XMLSchema10, XMLSchemaParseError
from xmlschema.exceptions import XMLSchemaValueError

from . import celery_app
from .models import XmlFileMetaModel, XmlValidationResult

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


@celery_app.task(name="xml_validate", bind=True)
def task_xml_validate(self, xml_meta: XmlFileMetaModel) -> XmlValidationResult:
    # update task status
    self.update_state(state='STARTED')
    # download xml
    xml_document = requests.get(xml_meta.url).text
    # schema for validation
    schema_type = xml_meta.schemaType

    if schema_type == "atom":
        schema_url = "https://inspire-geoportal.ec.europa.eu/schemas/inspire/atom/1.0/atom.xsd"
    elif schema_type == "openSearch":
        schema_url = "https://inspire-geoportal.ec.europa.eu/schemas/inspire/atom/1.0/opensearch.xsd"
    elif schema_type == "cswGetRecord":
        schema_url = csw_get_records
    else:
        schema_url = ""

    # validate
    try:

        if schema_url == "":
            validate(
                xml_document=xml_document,
            )
        else:
            validate(
                xml_document=xml_document,
                schema=schema_url
            )
        return XmlValidationResult(
            valid=True
        )
    except XMLSchemaValidationError as e:
        return XmlValidationResult(
            valid=False,
            msg=str(e)
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
    #
    # except Exception as e:
    #     try:
    #         validate(
    #             xml_document=xml_document,
    #             cls=XMLSchema11,
    #             path="https://inspire-geoportal.ec.europa.eu/schemas/inspire/atom/1.0/atom.xsd'"
    #         )
    #         return XmlValidationResult(
    #             valid=True
    #         )
    #     except XMLSchemaValidationError as e:
    #         return XmlValidationResult(
    #             valid=False,
    #             msg=str(e)
    #         )
