import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { PopupService } from './services/popup.service';
import { ToastService } from './services/toast.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [MessageService]

})
export class AppComponent {
  title = 'portal-pgi';

  displayModal = false;

  code = `failed validating <Element '{http://www.opengis.net/wms}Capability' at 0x7f46e5e3cae0> with XsdGroup(model='sequence', occurs=[1, 1]):\n\nReason: Unexpected child with tag '{http://inspire.ec.europa.eu/schemas/inspire_vs/1.0}ExtendedCapabilities' at position 3.\n\nSchema:\n\n  <complexType xmlns=\"http://www.w3.org/2001/XMLSchema\">\n      <sequence>\n          <element ref=\"wms:Request\" />\n          <element ref=\"wms:Exception\" />\n          <element ref=\"wms:_ExtendedCapabilities\" minOccurs=\"0\" maxOccurs=\"unbounded\" />\n          <element ref=\"wms:Layer\" minOccurs=\"0\" />\n      </sequence>\n  </complexType>\n\nInstance:\n\n  <Capability xmlns=\"http://www.opengis.net/wms\" xmlns:inspire_common=\"http://inspire.ec.europa.eu/schemas/common/1.0\" xmlns:inspire_vs=\"http://inspire.ec.europa.eu/schemas/inspire_vs/1.0\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n    <Request>\n      <GetCapabilities>\n        <Format>text/xml</Format>\n        <DCPType>\n          <HTTP>\n            <Get>\n              <OnlineResource xlink:type=\"simple\" xlink:href=\"http://mapy.geoportal.gov.pl/wss/geosrv/wmsAU/ows?SERVICE=WMS&amp;\" />\n            </Get>\n            <Post>\n              <OnlineResource xlink:type=\"simple\" xlink:href=\"http://mapy.geoportal.gov.pl/wss/geosrv/wmsAU/ows?SERVICE=WMS&amp;\" />\n            </Post>\n          </HTTP>\n        </DCPType>\n      </GetCapabilities>\n      <GetMap>\n        <Format>image/png</Format>\n        <Format>application/atom+xml</Format>\n        <Format>application/json;type=utfgrid</Format>\n        <Format>application/pdf</Format>\n    ...\n    ...\n  </Capability>\n\nPath: /WMS_Capabilities/Capability\n`

  constructor(private toastService: ToastService,
    private popupService: PopupService,
    private messageService: MessageService) {

      this.toastService.messageSuccess$.subscribe(text => {
        this.messageService.add({severity: 'success', summary: "Sukces", detail: text})
      })

      this.toastService.messageError$.subscribe(text => {
        this.messageService.add({severity: 'error', summary: "Błąd", detail: text})
      })

      this.toastService.messageInfo$.subscribe(text => {
        this.messageService.add({severity: 'info', summary: "Informacja", detail: text})
      })

      this.popupService.validationError$.subscribe(errorText => {
        this.code = errorText
        this.displayModal = true;
      })
  }
}
