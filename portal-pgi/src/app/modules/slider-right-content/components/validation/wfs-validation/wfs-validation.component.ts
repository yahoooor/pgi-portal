import { Component, OnInit } from '@angular/core';
import { NgxXml2jsonService } from 'ngx-xml2json';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, delay, distinctUntilChanged, repeatWhen, takeWhile, tap } from 'rxjs/operators';
import { HttpService } from 'src/app/services/http.service';
import { PopupService } from 'src/app/services/popup.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-wfs-validation',
  templateUrl: './wfs-validation.component.html',
  styleUrls: ['./wfs-validation.component.scss']
})
export class WfsValidationComponent implements OnInit {

  urlWfs = "";
  urlWfsChanged: Subject<string> = new Subject<string>();
  searchingWfs = false;


  httpGetCapabilities: Subscription = new Subscription;
  httpGetDescribeFeatureType: Subscription = new Subscription;
  httpGetFeature: Subscription = new Subscription;

  // loading flags
  loadingGetCapabilities = false;
  loadingDescribeFeatureType = false;
  loadingGetFeature = false;

  statusGetCapabilities = ""
  statusGetDescribeFeatureType = ""
  statusGetFeature = ""

  // errors
  errorsGetCapabilities: any[] = [];
  errorsGetCapabilities1: any[] = [
    {
      "reason": "Reason: <Element '{http://www.opengis.net/wfs/2.0}WFS_Capabilities' at 0x7fecd625f090> is not an element of the schema",
      "error": "failed validating <Element '{http://www.opengis.net/wfs/2.0}WFS_Capabilities' at 0x7fecd625f090> with XMLSchema10(name='inspire_dls.xsd', namespace='http://inspire.ec.europa.eu/schemas/inspire_dls/1.0'):\n\nReason: <Element '{http://www.opengis.net/wfs/2.0}WFS_Capabilities' at 0x7fecd625f090> is not an element of the schema\n\nInstance:\n\n  <wfs:WFS_Capabilities xmlns:fes=\"http://www.opengis.net/fes/2.0\" xmlns:inspire_common=\"http://inspire.ec.europa.eu/schemas/common/1.0\" xmlns:inspire_dls=\"http://inspire.ec.europa.eu/schemas/inspire_dls/1.0\" xmlns:ows=\"http://www.opengis.net/ows/1.1\" xmlns:wfs=\"http://www.opengis.net/wfs/2.0\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" version=\"2.0.0\" xsi:schemaLocation=\"http://www.opengis.net/wfs/2.0 http://schemas.opengis.net/wfs/2.0/wfs.xsd http://inspire.ec.europa.eu/schemas/inspire_dls/1.0 http://inspire.ec.europa.eu/schemas/inspire_dls/1.0/inspire_dls.xsd http://inspire.ec.europa.eu/schemas/common/1.0 http://inspire.ec.europa.eu/schemas/common/1.0/common.xsd\">\n    <ows:ServiceIdentification>\n      <ows:Title>Usługa pobierania Państwowego Rejestru Granic - jednostki administracyjne</ows:Title>\n      <ows:Abstract>Usługa WFS publikująca jednostki administracyjne Polski</ows:Abstract>\n      \n      <ows:ServiceType codeSpace=\"OGC\">WFS</ows:ServiceType>\n      <ows:ServiceTypeVersion>2.0.0</ows:ServiceTypeVersion>\n      <ows:Fees>Brak opłat</ows:Fees>\n      <ows:AccessConstraints />\n      \n    </ows:ServiceIdentification>\n    <ows:ServiceProvider>\n      <ows:ProviderName>Główny Urząd Geodezji i Kartografii</ows:ProviderName>\n      <ows:ProviderSite xlink:type=\"simple\" xlink:href=\"\" />\n      \n      <ows:ServiceContact>\n        <ows:IndividualName>Główny Geodeta Kraju</ows:IndividualName>\n        <ows:PositionName>owner</ows:PositionName>\n        <ows:ContactInfo>\n          <ows:Phone>\n    ...\n    ...\n  </wfs:WFS_Capabilities>\n\nPath: /wfs:WFS_Capabilities\n"
    },
    {
      "reason": "Reason: <Element '{http://www.opengis.net/wfs/2.0}WFS_Capabilities' at 0x7fecd694c360> is not an element of the schema",
      "error": "failed validating <Element '{http://www.opengis.net/wfs/2.0}WFS_Capabilities' at 0x7fecd694c360> with XMLSchema10(name='common.xsd', namespace='http://inspire.ec.europa.eu/schemas/common/1.0'):\n\nReason: <Element '{http://www.opengis.net/wfs/2.0}WFS_Capabilities' at 0x7fecd694c360> is not an element of the schema\n\nInstance:\n\n  <wfs:WFS_Capabilities xmlns:fes=\"http://www.opengis.net/fes/2.0\" xmlns:inspire_common=\"http://inspire.ec.europa.eu/schemas/common/1.0\" xmlns:inspire_dls=\"http://inspire.ec.europa.eu/schemas/inspire_dls/1.0\" xmlns:ows=\"http://www.opengis.net/ows/1.1\" xmlns:wfs=\"http://www.opengis.net/wfs/2.0\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" version=\"2.0.0\" xsi:schemaLocation=\"http://www.opengis.net/wfs/2.0 http://schemas.opengis.net/wfs/2.0/wfs.xsd http://inspire.ec.europa.eu/schemas/inspire_dls/1.0 http://inspire.ec.europa.eu/schemas/inspire_dls/1.0/inspire_dls.xsd http://inspire.ec.europa.eu/schemas/common/1.0 http://inspire.ec.europa.eu/schemas/common/1.0/common.xsd\">\n    <ows:ServiceIdentification>\n      <ows:Title>Usługa pobierania Państwowego Rejestru Granic - jednostki administracyjne</ows:Title>\n      <ows:Abstract>Usługa WFS publikująca jednostki administracyjne Polski</ows:Abstract>\n      \n      <ows:ServiceType codeSpace=\"OGC\">WFS</ows:ServiceType>\n      <ows:ServiceTypeVersion>2.0.0</ows:ServiceTypeVersion>\n      <ows:Fees>Brak opłat</ows:Fees>\n      <ows:AccessConstraints />\n      \n    </ows:ServiceIdentification>\n    <ows:ServiceProvider>\n      <ows:ProviderName>Główny Urząd Geodezji i Kartografii</ows:ProviderName>\n      <ows:ProviderSite xlink:type=\"simple\" xlink:href=\"\" />\n      \n      <ows:ServiceContact>\n        <ows:IndividualName>Główny Geodeta Kraju</ows:IndividualName>\n        <ows:PositionName>owner</ows:PositionName>\n        <ows:ContactInfo>\n          <ows:Phone>\n    ...\n    ...\n  </wfs:WFS_Capabilities>\n\nPath: /wfs:WFS_Capabilities\n"
    },
    {
      "reason": "Reason: <Element '{http://www.opengis.net/wfs/2.0}WFS_Capabilities' at 0x7fecd694c360> is not an element of the schema",
      "error": "failed validating <Element '{http://www.opengis.net/wfs/2.0}WFS_Capabilities' at 0x7fecd694c360> with XMLSchema10(name='common.xsd', namespace='http://inspire.ec.europa.eu/schemas/common/1.0'):\n\nReason: <Element '{http://www.opengis.net/wfs/2.0}WFS_Capabilities' at 0x7fecd694c360> is not an element of the schema\n\nInstance:\n\n  <wfs:WFS_Capabilities xmlns:fes=\"http://www.opengis.net/fes/2.0\" xmlns:inspire_common=\"http://inspire.ec.europa.eu/schemas/common/1.0\" xmlns:inspire_dls=\"http://inspire.ec.europa.eu/schemas/inspire_dls/1.0\" xmlns:ows=\"http://www.opengis.net/ows/1.1\" xmlns:wfs=\"http://www.opengis.net/wfs/2.0\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" version=\"2.0.0\" xsi:schemaLocation=\"http://www.opengis.net/wfs/2.0 http://schemas.opengis.net/wfs/2.0/wfs.xsd http://inspire.ec.europa.eu/schemas/inspire_dls/1.0 http://inspire.ec.europa.eu/schemas/inspire_dls/1.0/inspire_dls.xsd http://inspire.ec.europa.eu/schemas/common/1.0 http://inspire.ec.europa.eu/schemas/common/1.0/common.xsd\">\n    <ows:ServiceIdentification>\n      <ows:Title>Usługa pobierania Państwowego Rejestru Granic - jednostki administracyjne</ows:Title>\n      <ows:Abstract>Usługa WFS publikująca jednostki administracyjne Polski</ows:Abstract>\n      \n      <ows:ServiceType codeSpace=\"OGC\">WFS</ows:ServiceType>\n      <ows:ServiceTypeVersion>2.0.0</ows:ServiceTypeVersion>\n      <ows:Fees>Brak opłat</ows:Fees>\n      <ows:AccessConstraints />\n      \n    </ows:ServiceIdentification>\n    <ows:ServiceProvider>\n      <ows:ProviderName>Główny Urząd Geodezji i Kartografii</ows:ProviderName>\n      <ows:ProviderSite xlink:type=\"simple\" xlink:href=\"\" />\n      \n      <ows:ServiceContact>\n        <ows:IndividualName>Główny Geodeta Kraju</ows:IndividualName>\n        <ows:PositionName>owner</ows:PositionName>\n        <ows:ContactInfo>\n          <ows:Phone>\n    ...\n    ...\n  </wfs:WFS_Capabilities>\n\nPath: /wfs:WFS_Capabilities\n"
    },
    {
      "reason": "Reason: <Element '{http://www.opengis.net/wfs/2.0}WFS_Capabilities' at 0x7fecd694c360> is not an element of the schema",
      "error": "failed validating <Element '{http://www.opengis.net/wfs/2.0}WFS_Capabilities' at 0x7fecd694c360> with XMLSchema10(name='common.xsd', namespace='http://inspire.ec.europa.eu/schemas/common/1.0'):\n\nReason: <Element '{http://www.opengis.net/wfs/2.0}WFS_Capabilities' at 0x7fecd694c360> is not an element of the schema\n\nInstance:\n\n  <wfs:WFS_Capabilities xmlns:fes=\"http://www.opengis.net/fes/2.0\" xmlns:inspire_common=\"http://inspire.ec.europa.eu/schemas/common/1.0\" xmlns:inspire_dls=\"http://inspire.ec.europa.eu/schemas/inspire_dls/1.0\" xmlns:ows=\"http://www.opengis.net/ows/1.1\" xmlns:wfs=\"http://www.opengis.net/wfs/2.0\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" version=\"2.0.0\" xsi:schemaLocation=\"http://www.opengis.net/wfs/2.0 http://schemas.opengis.net/wfs/2.0/wfs.xsd http://inspire.ec.europa.eu/schemas/inspire_dls/1.0 http://inspire.ec.europa.eu/schemas/inspire_dls/1.0/inspire_dls.xsd http://inspire.ec.europa.eu/schemas/common/1.0 http://inspire.ec.europa.eu/schemas/common/1.0/common.xsd\">\n    <ows:ServiceIdentification>\n      <ows:Title>Usługa pobierania Państwowego Rejestru Granic - jednostki administracyjne</ows:Title>\n      <ows:Abstract>Usługa WFS publikująca jednostki administracyjne Polski</ows:Abstract>\n      \n      <ows:ServiceType codeSpace=\"OGC\">WFS</ows:ServiceType>\n      <ows:ServiceTypeVersion>2.0.0</ows:ServiceTypeVersion>\n      <ows:Fees>Brak opłat</ows:Fees>\n      <ows:AccessConstraints />\n      \n    </ows:ServiceIdentification>\n    <ows:ServiceProvider>\n      <ows:ProviderName>Główny Urząd Geodezji i Kartografii</ows:ProviderName>\n      <ows:ProviderSite xlink:type=\"simple\" xlink:href=\"\" />\n      \n      <ows:ServiceContact>\n        <ows:IndividualName>Główny Geodeta Kraju</ows:IndividualName>\n        <ows:PositionName>owner</ows:PositionName>\n        <ows:ContactInfo>\n          <ows:Phone>\n    ...\n    ...\n  </wfs:WFS_Capabilities>\n\nPath: /wfs:WFS_Capabilities\n"
    },
    {
      "reason": "Reason: <Element '{http://www.opengis.net/wfs/2.0}WFS_Capabilities' at 0x7fecd694c360> is not an element of the schema",
      "error": "failed validating <Element '{http://www.opengis.net/wfs/2.0}WFS_Capabilities' at 0x7fecd694c360> with XMLSchema10(name='common.xsd', namespace='http://inspire.ec.europa.eu/schemas/common/1.0'):\n\nReason: <Element '{http://www.opengis.net/wfs/2.0}WFS_Capabilities' at 0x7fecd694c360> is not an element of the schema\n\nInstance:\n\n  <wfs:WFS_Capabilities xmlns:fes=\"http://www.opengis.net/fes/2.0\" xmlns:inspire_common=\"http://inspire.ec.europa.eu/schemas/common/1.0\" xmlns:inspire_dls=\"http://inspire.ec.europa.eu/schemas/inspire_dls/1.0\" xmlns:ows=\"http://www.opengis.net/ows/1.1\" xmlns:wfs=\"http://www.opengis.net/wfs/2.0\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" version=\"2.0.0\" xsi:schemaLocation=\"http://www.opengis.net/wfs/2.0 http://schemas.opengis.net/wfs/2.0/wfs.xsd http://inspire.ec.europa.eu/schemas/inspire_dls/1.0 http://inspire.ec.europa.eu/schemas/inspire_dls/1.0/inspire_dls.xsd http://inspire.ec.europa.eu/schemas/common/1.0 http://inspire.ec.europa.eu/schemas/common/1.0/common.xsd\">\n    <ows:ServiceIdentification>\n      <ows:Title>Usługa pobierania Państwowego Rejestru Granic - jednostki administracyjne</ows:Title>\n      <ows:Abstract>Usługa WFS publikująca jednostki administracyjne Polski</ows:Abstract>\n      \n      <ows:ServiceType codeSpace=\"OGC\">WFS</ows:ServiceType>\n      <ows:ServiceTypeVersion>2.0.0</ows:ServiceTypeVersion>\n      <ows:Fees>Brak opłat</ows:Fees>\n      <ows:AccessConstraints />\n      \n    </ows:ServiceIdentification>\n    <ows:ServiceProvider>\n      <ows:ProviderName>Główny Urząd Geodezji i Kartografii</ows:ProviderName>\n      <ows:ProviderSite xlink:type=\"simple\" xlink:href=\"\" />\n      \n      <ows:ServiceContact>\n        <ows:IndividualName>Główny Geodeta Kraju</ows:IndividualName>\n        <ows:PositionName>owner</ows:PositionName>\n        <ows:ContactInfo>\n          <ows:Phone>\n    ...\n    ...\n  </wfs:WFS_Capabilities>\n\nPath: /wfs:WFS_Capabilities\n"
    },
    {
      "reason": "Reason: <Element '{http://www.opengis.net/wfs/2.0}WFS_Capabilities' at 0x7fecd694c360> is not an element of the schema",
      "error": "failed validating <Element '{http://www.opengis.net/wfs/2.0}WFS_Capabilities' at 0x7fecd694c360> with XMLSchema10(name='common.xsd', namespace='http://inspire.ec.europa.eu/schemas/common/1.0'):\n\nReason: <Element '{http://www.opengis.net/wfs/2.0}WFS_Capabilities' at 0x7fecd694c360> is not an element of the schema\n\nInstance:\n\n  <wfs:WFS_Capabilities xmlns:fes=\"http://www.opengis.net/fes/2.0\" xmlns:inspire_common=\"http://inspire.ec.europa.eu/schemas/common/1.0\" xmlns:inspire_dls=\"http://inspire.ec.europa.eu/schemas/inspire_dls/1.0\" xmlns:ows=\"http://www.opengis.net/ows/1.1\" xmlns:wfs=\"http://www.opengis.net/wfs/2.0\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" version=\"2.0.0\" xsi:schemaLocation=\"http://www.opengis.net/wfs/2.0 http://schemas.opengis.net/wfs/2.0/wfs.xsd http://inspire.ec.europa.eu/schemas/inspire_dls/1.0 http://inspire.ec.europa.eu/schemas/inspire_dls/1.0/inspire_dls.xsd http://inspire.ec.europa.eu/schemas/common/1.0 http://inspire.ec.europa.eu/schemas/common/1.0/common.xsd\">\n    <ows:ServiceIdentification>\n      <ows:Title>Usługa pobierania Państwowego Rejestru Granic - jednostki administracyjne</ows:Title>\n      <ows:Abstract>Usługa WFS publikująca jednostki administracyjne Polski</ows:Abstract>\n      \n      <ows:ServiceType codeSpace=\"OGC\">WFS</ows:ServiceType>\n      <ows:ServiceTypeVersion>2.0.0</ows:ServiceTypeVersion>\n      <ows:Fees>Brak opłat</ows:Fees>\n      <ows:AccessConstraints />\n      \n    </ows:ServiceIdentification>\n    <ows:ServiceProvider>\n      <ows:ProviderName>Główny Urząd Geodezji i Kartografii</ows:ProviderName>\n      <ows:ProviderSite xlink:type=\"simple\" xlink:href=\"\" />\n      \n      <ows:ServiceContact>\n        <ows:IndividualName>Główny Geodeta Kraju</ows:IndividualName>\n        <ows:PositionName>owner</ows:PositionName>\n        <ows:ContactInfo>\n          <ows:Phone>\n    ...\n    ...\n  </wfs:WFS_Capabilities>\n\nPath: /wfs:WFS_Capabilities\n"
    },
    {
      "reason": "Reason: <Element '{http://www.opengis.net/wfs/2.0}WFS_Capabilities' at 0x7fecd694c360> is not an element of the schema",
      "error": "failed validating <Element '{http://www.opengis.net/wfs/2.0}WFS_Capabilities' at 0x7fecd694c360> with XMLSchema10(name='common.xsd', namespace='http://inspire.ec.europa.eu/schemas/common/1.0'):\n\nReason: <Element '{http://www.opengis.net/wfs/2.0}WFS_Capabilities' at 0x7fecd694c360> is not an element of the schema\n\nInstance:\n\n  <wfs:WFS_Capabilities xmlns:fes=\"http://www.opengis.net/fes/2.0\" xmlns:inspire_common=\"http://inspire.ec.europa.eu/schemas/common/1.0\" xmlns:inspire_dls=\"http://inspire.ec.europa.eu/schemas/inspire_dls/1.0\" xmlns:ows=\"http://www.opengis.net/ows/1.1\" xmlns:wfs=\"http://www.opengis.net/wfs/2.0\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" version=\"2.0.0\" xsi:schemaLocation=\"http://www.opengis.net/wfs/2.0 http://schemas.opengis.net/wfs/2.0/wfs.xsd http://inspire.ec.europa.eu/schemas/inspire_dls/1.0 http://inspire.ec.europa.eu/schemas/inspire_dls/1.0/inspire_dls.xsd http://inspire.ec.europa.eu/schemas/common/1.0 http://inspire.ec.europa.eu/schemas/common/1.0/common.xsd\">\n    <ows:ServiceIdentification>\n      <ows:Title>Usługa pobierania Państwowego Rejestru Granic - jednostki administracyjne</ows:Title>\n      <ows:Abstract>Usługa WFS publikująca jednostki administracyjne Polski</ows:Abstract>\n      \n      <ows:ServiceType codeSpace=\"OGC\">WFS</ows:ServiceType>\n      <ows:ServiceTypeVersion>2.0.0</ows:ServiceTypeVersion>\n      <ows:Fees>Brak opłat</ows:Fees>\n      <ows:AccessConstraints />\n      \n    </ows:ServiceIdentification>\n    <ows:ServiceProvider>\n      <ows:ProviderName>Główny Urząd Geodezji i Kartografii</ows:ProviderName>\n      <ows:ProviderSite xlink:type=\"simple\" xlink:href=\"\" />\n      \n      <ows:ServiceContact>\n        <ows:IndividualName>Główny Geodeta Kraju</ows:IndividualName>\n        <ows:PositionName>owner</ows:PositionName>\n        <ows:ContactInfo>\n          <ows:Phone>\n    ...\n    ...\n  </wfs:WFS_Capabilities>\n\nPath: /wfs:WFS_Capabilities\n"
    },
    {
      "reason": "Reason: <Element '{http://www.opengis.net/wfs/2.0}WFS_Capabilities' at 0x7fecd694c360> is not an element of the schema",
      "error": "failed vahttps://haleconnect.com/ows/services/org.292.6cef2128-a227-4aa7-bc74-0e3797644d51_wfs?SERVICE=WFS&REQUEST=GetCapabilities&VERSION=2.0.0lidating <Element '{http://www.opengis.net/wfs/2.0}WFS_Capabilities' at 0x7fecd694c360> with XMLSchema10(name='common.xsd', namespace='http://inspire.ec.europa.eu/schemas/common/1.0'):\n\nReason: <Element '{http://www.opengis.net/wfs/2.0}WFS_Capabilities' at 0x7fecd694c360> is not an element of the schema\n\nInstance:\n\n  <wfs:WFS_Capabilities xmlns:fes=\"http://www.opengis.net/fes/2.0\" xmlns:inspire_common=\"http://inspire.ec.europa.eu/schemas/common/1.0\" xmlns:inspire_dls=\"http://inspire.ec.europa.eu/schemas/inspire_dls/1.0\" xmlns:ows=\"http://www.opengis.net/ows/1.1\" xmlns:wfs=\"http://www.opengis.net/wfs/2.0\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" version=\"2.0.0\" xsi:schemaLocation=\"http://www.opengis.net/wfs/2.0 http://schemas.opengis.net/wfs/2.0/wfs.xsd http://inspire.ec.europa.eu/schemas/inspire_dls/1.0 http://inspire.ec.europa.eu/schemas/inspire_dls/1.0/inspire_dls.xsd http://inspire.ec.europa.eu/schemas/common/1.0 http://inspire.ec.europa.eu/schemas/common/1.0/common.xsd\">\n    <ows:ServiceIdentification>\n      <ows:Title>Usługa pobierania Państwowego Rejestru Granic - jednostki administracyjne</ows:Title>\n      <ows:Abstract>Usługa WFS publikująca jednostki administracyjne Polski</ows:Abstract>\n      \n      <ows:ServiceType codeSpace=\"OGC\">WFS</ows:ServiceType>\n      <ows:ServiceTypeVersion>2.0.0</ows:ServiceTypeVersion>\n      <ows:Fees>Brak opłat</ows:Fees>\n      <ows:AccessConstraints />\n      \n    </ows:ServiceIdentification>\n    <ows:ServiceProvider>\n      <ows:ProviderName>Główny Urząd Geodezji i Kartografii</ows:ProviderName>\n      <ows:ProviderSite xlink:type=\"simple\" xlink:href=\"\" />\n      \n      <ows:ServiceContact>\n        <ows:IndividualName>Główny Geodeta Kraju</ows:IndividualName>\n        <ows:PositionName>owner</ows:PositionName>\n        <ows:ContactInfo>\n          <ows:Phone>\n    ...\n    ...\n  </wfs:WFS_Capabilities>\n\nPath: /wfs:WFS_Capabilities\n"
    },
    {
      "reason": "Reason: <Element '{http://www.opengis.net/wfs/2.0}WFS_Capabilities' at 0x7fecd694c360> is not an element of the schema",
      "error": "failed validating <Element '{http://www.opengis.net/wfs/2.0}WFS_Capabilities' at 0x7fecd694c360> with XMLSchema10(name='common.xsd', namespace='http://inspire.ec.europa.eu/schemas/common/1.0'):\n\nReason: <Element '{http://www.opengis.net/wfs/2.0}WFS_Capabilities' at 0x7fecd694c360> is not an element of the schema\n\nInstance:\n\n  <wfs:WFS_Capabilities xmlns:fes=\"http://www.opengis.net/fes/2.0\" xmlns:inspire_common=\"http://inspire.ec.europa.eu/schemas/common/1.0\" xmlns:inspire_dls=\"http://inspire.ec.europa.eu/schemas/inspire_dls/1.0\" xmlns:ows=\"http://www.opengis.net/ows/1.1\" xmlns:wfs=\"http://www.opengis.net/wfs/2.0\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" version=\"2.0.0\" xsi:schemaLocation=\"http://www.opengis.net/wfs/2.0 http://schemas.opengis.net/wfs/2.0/wfs.xsd http://inspire.ec.europa.eu/schemas/inspire_dls/1.0 http://inspire.ec.europa.eu/schemas/inspire_dls/1.0/inspire_dls.xsd http://inspire.ec.europa.eu/schemas/common/1.0 http://inspire.ec.europa.eu/schemas/common/1.0/common.xsd\">\n    <ows:ServiceIdentification>\n      <ows:Title>Usługa pobierania Państwowego Rejestru Granic - jednostki administracyjne</ows:Title>\n      <ows:Abstract>Usługa WFS publikująca jednostki administracyjne Polski</ows:Abstract>\n      \n      <ows:ServiceType codeSpace=\"OGC\">WFS</ows:ServiceType>\n      <ows:ServiceTypeVersion>2.0.0</ows:ServiceTypeVersion>\n      <ows:Fees>Brak opłat</ows:Fees>\n      <ows:AccessConstraints />\n      \n    </ows:ServiceIdentification>\n    <ows:ServiceProvider>\n      <ows:ProviderName>Główny Urząd Geodezji i Kartografii</ows:ProviderName>\n      <ows:ProviderSite xlink:type=\"simple\" xlink:href=\"\" />\n      \n      <ows:ServiceContact>\n        <ows:IndividualName>Główny Geodeta Kraju</ows:IndividualName>\n        <ows:PositionName>owner</ows:PositionName>\n        <ows:ContactInfo>\n          <ows:Phone>\n    ...\n    ...\n  </wfs:WFS_Capabilities>\n\nPath: /wfs:WFS_Capabilities\n"
    }
  ];
  errorsDescribeFeatureType: any[] = [];
  errorsGetFeature: any[] = [];
  // result description
  textGetCapabilities = ""
  textDescribeFeatureType = ""
  textGetFeature = ""

  constructor(
    private toastService: ToastService,
    private http: HttpService,
    private popupService: PopupService,
    private ngxXml2jsonService: NgxXml2jsonService

  ) {
    this.urlWfsChanged.pipe(
      debounceTime(600),
      distinctUntilChanged()
    ).subscribe(() => {
      //this.resetSearching()
      this.parseGetCapabilities(this.urlWfs)
    })
  }

  ngOnInit(): void {
  }

  parseGetCapabilities(url: string) {

    if (url == " " || url == "") {
      return
    }

    this.resetSearching()
    this.startloadingAll()

    url = this.http.corsUrl + url

    if (!url.includes("?")) {
      url = url + "?SERVICE=WFS&REQUEST=getCapabilities"
    }

    this.http.getCapabilities(url).subscribe(
      (dataXML: any) => {

        const parser = new DOMParser();
        const xml = parser.parseFromString(dataXML, 'text/xml');
        const obj = this.ngxXml2jsonService.xmlToJson(xml) as any;
        console.log(obj)

        let capabilities = obj.WFS_Capabilities || obj['wfs:WFS_Capabilities']
        let featureTypeList = capabilities.FeatureTypeList || capabilities['wfs:FeatureTypeList']
        let featureList = featureTypeList.FeatureType || featureTypeList['wfs:FeatureType']

        if (!Array.isArray(featureList)) {
          featureList = [featureList]
        }

        // get name one of featuers
        let selectedFeature = featureList[0].Name
        console.log("SELECTED FEATURE: ", selectedFeature)

        // get version
        let version = findAllByKey(capabilities, "ows:ServiceTypeVersion")[0]
        console.log("VERSIONS", version)


        this.validateGetCapabilities(url)
        this.validateDescribeFeatureType(url, selectedFeature, version)
        this.validateGetFeature(url, selectedFeature, version)

      },
      error => {
        this.closeLoadingAll()
        this.toastService.showMessageError("Błąd podczas wczytywania pliku getCapabilities")
      }
    )

  }

  validateGetCapabilities(url: string) {

    let urlGetCapabilities = url.split("?")[0]
    urlGetCapabilities = urlGetCapabilities +
      "?" +
      "SERVICE=WFS" +
      "&REQUEST=getCapabilities"

    console.log("GET_CAPABILITIES URL: ", urlGetCapabilities)

    /*
    this.httpGetCapabilities = this.http.validateXML(urlGetCapabilities).subscribe(
      (data: any) => {
        console.log("VALIDATION GET CAPABILITIES: ", data)

        if (data.isValid === false) {
          this.errorsGetCapabilities = data.errors
        } else {
          this.textGetCapabilities = "Brak błędów"
        }

        this.loadingGetCapabilities = false;
      },
      error => {
        this.textGetCapabilities = "BŁĄD PODCZAS WCZYTYWANIA"
        this.loadingGetCapabilities = false;
      }
    )
    */

    urlGetCapabilities = urlGetCapabilities.replace(this.http.corsUrl, "")
    this.httpGetCapabilities = this.http.validateXml(urlGetCapabilities).subscribe(
      (data: any) => {
        this.http.getValidationStatus(data['task_id']).pipe(
          tap((result: any) => this.statusGetCapabilities = result.status),
          tap(() => this.loadingGetCapabilities = true),
          repeatWhen(
            (s) => s.pipe(
              takeWhile(() => (this.statusGetCapabilities !== "SUCCESS" && this.statusGetCapabilities !== "FAILURE")),
              delay(5000),
            )
          ),

        ).subscribe(
          data => {
            console.log(data)

            if(data.status == "SUCCESS") {

              if (data.result.valid) {
                this.textGetCapabilities = "Brak błędów"
              } else {
                this.errorsGetCapabilities = [data.result.msg]
              }

              this.loadingGetCapabilities = false;
            } else if (data.status == "FAILURE") {

              this.textGetCapabilities = "Błąd pliku podczas walidacji"
              this.loadingGetCapabilities = false;

            }
          },
          error => {
            this.textGetCapabilities = "Brak połączenia z walidatorem"
          }
        )
      }
    )

  }

  validateDescribeFeatureType(url: string, featureName: string, version: string) {
    let baseUrl = url.split("?")[0]
    let urlDescribeFeatureType = baseUrl +
      `?SERVICE=WFS` +
      `&REQUEST=describeFeatureType` +
      `&typenames=${featureName}` +
      `&version=${version}`

    console.log("DESCRIBE_FEATURE_TYPE URL: ", urlDescribeFeatureType)


    /*
    this.httpGetDescribeFeatureType = this.http.validateXML(urlDescribeFeatureType).subscribe(
      (data: any) => {
        console.log("VALIDATION DESCRIBE_FEATURE_TYPE: ", data)

        if (data.isValid === false) {
          this.errorsDescribeFeatureType = data.errors
        } else {
          this.textDescribeFeatureType = "Brak błędów"
        }

        this.loadingDescribeFeatureType = false;
      },
      error => {
        console.log(error)
        //this.textDescribeFeatureType = "BŁĄD PODCZAS WCZYTYWANIA"
        this.textDescribeFeatureType = "Brak błędów"

        this.loadingDescribeFeatureType = false;
      }
    ) */

    urlDescribeFeatureType = urlDescribeFeatureType.replace(this.http.corsUrl, "")
    
    this.httpGetDescribeFeatureType = this.http.validateXml(urlDescribeFeatureType).subscribe(
      (data: any) => {
        this.http.getValidationStatus(data['task_id']).pipe(
          tap((result: any) => this.statusGetDescribeFeatureType = result.status),
          tap(() => this.loadingDescribeFeatureType = true),
          repeatWhen(
            (s) => s.pipe(
              takeWhile(() => (this.statusGetDescribeFeatureType !== "SUCCESS" && this.statusGetDescribeFeatureType !== "FAILURE")),
              delay(5000),
            )
          ),

        ).subscribe(
          data => {
            console.log(data)

            if(data.status == "SUCCESS") {

              if (data.result.valid) {
                this.textDescribeFeatureType = "Brak błędów"
              } else {
                this.errorsDescribeFeatureType = [data.result.msg]
              }

              this.loadingDescribeFeatureType = false;
            } else if (data.status == "FAILURE") {

              this.textDescribeFeatureType = "Błąd pliku podczas walidacji"
              this.loadingDescribeFeatureType = false;

            }
          },
          error => {
            this.textDescribeFeatureType = "Brak połączenia z walidatorem"
          }
        )
      }
    )

  }

  validateGetFeature(url: string, featureName: string, version: string) {
    let baseUrl = url.split("?")[0]
    let urlGetFeature = baseUrl +
      `?SERVICE=WFS` +
      `&REQUEST=getFeature` +
      `&typenames=${featureName}` +
      `&version=${version}` +
      `&count=5`


    console.log("GET_FEATURE URL: ", urlGetFeature)
    //this.errorsGetFeature = `failed validating <Element '{http://inspire.ec.europa.eu/schemas/ps/4.0}legalFoundationDocument' at 0x7f34f3cdbd60> with XsdElement(name='{http://inspire.ec.europa.eu/schemas/ps/4.0}legalFoundationDocument', occurs=[1, 1]): Reason: element is not nillable Schema: <xs:element xmlns:xs="http://www.w3.org/2001/XMLSchema" name="{http://inspire.ec.europa.eu/schemas/ps/4.0}legalFoundationDocument" form="unqualified" /> Instance: <ps:legalFoundationDocument xmlns:ps="http://inspire.ec.europa.eu/schemas/ps/4.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:nil="true" /> Path: /wfs:FeatureCollection/wfs:member[1]/ps:ProtectedSite/ps:legalFoundationDocument ,failed validating <Element '{http://inspire.ec.europa.eu/schemas/gn/4.0}language' at 0x7f34f3cdbb80> with XsdElement(name='{http://inspire.ec.europa.eu/schemas/gn/4.0}language', occurs=[1, 1]): Reason: element is not nillable Schema: <xs:element xmlns:xs="http://www.w3.org/2001/XMLSchema" name="{http://inspire.ec.europa.eu/schemas/gn/4.0}language" form="unqualified" /> Instance: <gn:language xmlns:gn="http://inspire.ec.europa.eu/schemas/gn/4.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:nil="true" /> Path: /wfs:FeatureCollection/wfs:member[1]/ps:ProtectedSite/ps:siteName/gn:GeographicalName/gn:language` //` ,failed validating <Element '{http://inspire.ec.europa.eu/schemas/gn/4.0}nativeness' at 0x7f34f3cdbbd0> with XsdElement(name='{http://inspire.ec.europa.eu/schemas/gn/4.0}native`

    /*
    this.httpGetFeature = this.http.validateXML(urlGetFeature).subscribe(
      (data: any) => {
        console.log("VALIDATION GET_FEATURE: ", data)

        if (data.isValid === false) {
          this.errorsGetFeature = data.errors
        } else {
          this.textGetFeature = "Brak błędów"
        }

        this.loadingGetFeature = false;
      },
      error => {
        this.textGetFeature = "BŁĄD PODCZAS WCZYTYWANIA"
        this.loadingGetFeature = false;
      }
    ) */

    urlGetFeature = urlGetFeature.replace(this.http.corsUrl, "")
    this.httpGetFeature = this.http.validateXml(urlGetFeature).subscribe(
      (data: any) => {
        this.http.getValidationStatus(data['task_id']).pipe(
          tap((result: any) => this.statusGetFeature = result.status),
          tap(() => this.loadingGetFeature = true),
          repeatWhen(
            (s) => s.pipe(
              takeWhile(() => (this.statusGetFeature !== "SUCCESS" && this.statusGetFeature !== "FAILURE")),
              delay(5000),
            )
          ),

        ).subscribe(
          data => {
            console.log(data)

            if(data.status == "SUCCESS") {

              if (data.result.valid) {
                this.textGetFeature = "Brak błędów"
              } else {
                this.errorsGetFeature = [data.result.msg]
              }

              this.loadingGetFeature = false;
            } else if (data.status == "FAILURE") {

              this.textGetFeature = "Błąd pliku podczas walidacji"
              this.loadingGetFeature = false;

            }
          },
          error => {
            this.textGetFeature = "Brak połączenia z walidatorem"
          }
        )
      }
    )

  }

  resetSearching() {
    this.searchingWfs = false;
    this.closeLoadingAll();

    this.errorsDescribeFeatureType = [];
    this.errorsGetCapabilities = [];
    this.errorsGetFeature = [];

    this.textDescribeFeatureType = "";
    this.textGetCapabilities = "";
    this.textGetFeature = "";

    this.httpGetCapabilities.unsubscribe()
    this.httpGetDescribeFeatureType.unsubscribe()
    this.httpGetFeature.unsubscribe()
  }

  cancelSearching() {
    this.closeLoadingAll();
    this.resetSearching()  ;
    this.urlWfs = "";
    this.wfsInputChange();

  }

  wfsInputChange() {
    this.urlWfsChanged.next(this.urlWfs)
  }

  startloadingAll() {
    this.loadingGetCapabilities = true;
    this.loadingDescribeFeatureType = true;
    this.loadingGetFeature = true;
  }

  closeLoadingAll() {
    this.loadingGetCapabilities = false;
    this.loadingDescribeFeatureType = false;
    this.loadingGetFeature = false;
  }

  showValidationError(error: string) {
    // this.popupService.showError(error)
  }

}

function findAllByKey(obj: any, keyToFind: string) {
  return Object.entries(obj)
    .reduce((acc, [key, value]: any): any => (key === keyToFind)
      ? acc.concat(value)
      : (typeof value === 'object')
        ? acc.concat(findAllByKey(value, keyToFind))
        : acc
      , [])
}