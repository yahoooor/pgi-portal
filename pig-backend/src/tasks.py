import requests
from lxml import etree
from celery.utils.log import get_task_logger
from .models import XmlFileMetaModel, XmlValidationResult
from . import celery_app


logger = get_task_logger(__name__)


XSI = "http://www.w3.org/2001/XMLSchema-instance"
XS = '{http://www.w3.org/2001/XMLSchema}'
SCHEMA_TEMPLATE = \
"""<?xml version = "1.0" encoding = "UTF-8"?>
<xs:schema xmlns="http://dummy.libxml2.validator"
    targetNamespace="http://dummy.libxml2.validator"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    version="1.0"
    elementFormDefault="qualified"
    attributeFormDefault="unqualified">
</xs:schema>""".encode("utf-8")

    
@celery_app.task(name="xml_validate", bind=True)
def task_xml_validate(self, xml_meta: XmlFileMetaModel) -> XmlValidationResult:
    # update task status
    self.update_state(state='STARTED')
    # download xml
    xml_txt = requests.get(xml_meta.url).text
    print(xml_txt)
    # create xml tree
    xml_tree = etree.XML(xml_txt.encode("utf-8"))
    # extract schemas and build schemas tree
    schema_tree = etree.XML(SCHEMA_TEMPLATE)
    schema_locations = set(xml_tree.xpath("//*/@xsi:schemaLocation", namespaces={'xsi': XSI}))
    for schema_location in schema_locations:
        namespaces_locations = schema_location.strip().split()
        for namespace, location in zip(*[iter(namespaces_locations)] * 2):
            xs_import = etree.Element(XS + "import")
            xs_import.attrib['namespace'] = namespace
            xs_import.attrib['schemaLocation'] = location
            schema_tree.append(xs_import)
    # create xml schema
    schema = etree.XMLSchema(schema_tree)
    try:
        schema.assertValid(xml_tree)
        return XmlValidationResult(
            valid=True
        )
    except Exception as e:
        return XmlValidationResult(
            valid=False,
            msg = str(e)
        )
    