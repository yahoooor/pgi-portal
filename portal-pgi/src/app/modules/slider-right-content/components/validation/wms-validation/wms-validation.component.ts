import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgxXml2jsonService } from 'ngx-xml2json';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, delay, distinctUntilChanged, repeatWhen, takeWhile, tap } from 'rxjs/operators';
import { HttpService } from 'src/app/services/http.service';
import { PopupService } from 'src/app/services/popup.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-wms-validation',
  templateUrl: './wms-validation.component.html',
  styleUrls: ['./wms-validation.component.scss']
})
export class WmsValidationComponent implements OnInit {

  @ViewChild('getMapImg') getMapImg: ElementRef | undefined

  urlWms = "";
  urlWmsChanged: Subject<string> = new Subject<string>();
  searchingWms = false;


  httpGetCapabilities: Subscription = new Subscription;
  httpGetDescribeFeatureType: Subscription = new Subscription;
  httpGetFeature: Subscription = new Subscription;

  // loading flags
  loadingGetFeature = false;
  loadingGetCapabilities = false;

  // errors
  errorsGetCapabilities: any[] = [];
  errorsGetFeature: any[] = [];
  // result description
  textGetFeature = ""
  textGetCapabilities = ""
  statusGetFeature = ""
  statusGetCapabilities = ""

  urlGetMap = ""
  urlGetFeatureInfo: string = "";

  clickX = ""
  clickY = ""
  baseUrl = ""
  crs = ""
  layerName = ""
  bboxString = ""

  isGetMapVisible = false;



  constructor(
    private toastService: ToastService,
    private http: HttpService,
    private popupService: PopupService,
    private ngxXml2jsonService: NgxXml2jsonService

  ) {
    this.urlWmsChanged.pipe(
      debounceTime(600),
      distinctUntilChanged()
    ).subscribe(() => {
      //this.resetSearching()
      this.inputChanged()
      this.parseGetCapabilities(this.urlWms)
    })
  }

  ngOnInit(): void {
  }

  imgClick(e: any) {
    this.clickX = e.offsetX
    this.clickY = e.offsetY

    if (!this.loadingGetFeature) {
      this.loadingGetFeature = true;

      let urlGetFeatureInfo = this.baseUrl +
        "?" +
        "SERVICE=WMS" +
        "&REQUEST=getFeatureInfo" +
        `&VERSION=1.3.0` +
        `&STYLES=` +
        `&TRANSPARENT=TRUE` +
        `&FORMAT=image/png` +
        `&WIDTH=300&HEIGHT=300` +
        `&LAYERS=${this.layerName}` +
        `&CRS=${this.crs}` +
        `&BBOX=${this.bboxString}` +
        `&query_layers=${this.layerName}` +
        `&INFO_FORMAT=text/xml` +
        `&i=${this.clickX}` +
        `&j=${this.clickY}`


      console.log(this.urlGetMap)
      console.log(urlGetFeatureInfo)
      this.urlGetFeatureInfo = urlGetFeatureInfo.replace("http://192.168.1.63:3002/", "")

      /*
      this.http.validateXML(urlGetFeatureInfo).subscribe(
        (data: any) => {
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
      )
      */
      
      urlGetFeatureInfo = urlGetFeatureInfo.replace(this.http.corsUrl, "")
      
      this.http.validateXml(urlGetFeatureInfo).subscribe(
        (data: any) => {
          this.http.getValidationStatus(data['task_id']).pipe(
            tap((result: any) => this.statusGetFeature = result.status),
            repeatWhen(
              (s) => s.pipe(
                takeWhile(() => this.statusGetFeature !== "SUCCESS" && this.statusGetFeature !== "FAILURE"),
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


  }

  parseGetCapabilities(url: string) {

    this.startloadingAll()

    url = this.http.corsUrl + url

    if (!url.includes("?")) {
      url = url + "?SERVICE=WMS&REQUEST=getCapabilities"
    }

    this.http.getCapabilities(url).subscribe(
      (dataXML: any) => {

        const parser = new DOMParser();
        const xml = parser.parseFromString(dataXML, 'text/xml');
        const obj = this.ngxXml2jsonService.xmlToJson(xml) as any;
        console.log(obj)

        let capabilities = obj.WMS_Capabilities || obj['wms:WMS_Capabilities']

        // get layer
        let layers = capabilities.Capability.Layer.Layer
        if ("Layer" in layers) {
          layers = layers.Layer
        }

        let layerName = Array.isArray(layers) ? layers[0].Name : layers.Name

        // get bbox
        let boundingBoxes = Array.isArray(layers) ? layers[0].BoundingBox : layers.BoundingBox
        let boundingBox
        let crs = ""

        if (Array.isArray(boundingBoxes)) {

          for (let bbox of boundingBoxes) {
            if (bbox['@attributes']['CRS'].includes("EPSG:4326")) {
              boundingBox = bbox['@attributes']
              crs = boundingBox['CRS']
            }
          }
        } else {
          boundingBox = boundingBoxes['@attributes']
          crs = boundingBox["CRS"]
        }

        let bboxString = `${boundingBox.minx}%2C${boundingBox.miny}%2C${boundingBox.maxx}%2C${boundingBox.maxy}`
        console.log(bboxString)
        console.log(crs)

        // get version
        let version = findAllByKey(capabilities, "ows:ServiceTypeVersion")[0]
        console.log("VERSIONS", version)

        let baseUrl = url.split("?")[0]
        this.urlGetMap = baseUrl +
          "?" +
          "SERVICE=WMS" +
          "&REQUEST=getMap" +
          `&VERSION=1.3.0` +
          `&STYLES=` +
          `&TRANSPARENT=TRUE` +
          `&FORMAT=image/png` +
          `&WIDTH=300&HEIGHT=300` +
          `&LAYERS=${layerName}` +
          `&CRS=${crs}` +
          `&BBOX=${bboxString}`

        this.urlGetMap = this.urlGetMap.replace("http://192.168.1.63:3002/", "")
        this.isGetMapVisible = true;

        this.crs = crs
        this.layerName = layerName
        this.bboxString = bboxString
        this.baseUrl = baseUrl

        this.validateGetCapabilities(this.urlGetMap)


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
      "SERVICE=WMS" +
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
    ) */

    urlGetCapabilities = urlGetCapabilities.replace(this.http.corsUrl, "")
    this.http.validateXml(urlGetCapabilities).subscribe(
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



  resetSearching() {
    this.searchingWms = false;
    this.urlWms = "";
    this.clickX = ""
    this.clickY = ""
    this.closeLoadingAll();
    this.urlGetMap = "";
    this.isGetMapVisible = false;

    this.errorsGetCapabilities = [];
    this.errorsGetFeature = [];

    this.textGetCapabilities = "";
    this.textGetFeature = "";

    this.httpGetCapabilities.unsubscribe()
    this.httpGetDescribeFeatureType.unsubscribe()
    this.httpGetFeature.unsubscribe()
  }

  cancelSearching() {
    this.closeLoadingAll();
    this.resetSearching()

  }

  inputChanged() {
    this.searchingWms = false;
    this.clickX = ""
    this.clickY = ""
    //this.closeLoadingAll();
    this.urlGetMap = "";
    this.isGetMapVisible = false;

    this.errorsGetCapabilities = [];
    this.errorsGetFeature = [];

    this.textGetCapabilities = "";
    this.textGetFeature = "";

    this.httpGetCapabilities.unsubscribe()
    this.httpGetDescribeFeatureType.unsubscribe()
    this.httpGetFeature.unsubscribe()
  }

  wmsInputChange() {
    this.urlWmsChanged.next(this.urlWms)
  }

  startloadingAll() {
    this.loadingGetCapabilities = true;
    //this.loadingGetFeature = true;
  }

  closeLoadingAll() {
    this.loadingGetCapabilities = false;
    this.loadingGetFeature = false;
  }

  showValidationError(error: string) {

    //this.popupService.showError(error)
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