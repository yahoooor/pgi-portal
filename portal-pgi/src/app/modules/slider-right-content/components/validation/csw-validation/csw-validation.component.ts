import { Component, OnInit } from '@angular/core';
import { NgxXml2jsonService } from 'ngx-xml2json';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, delay, distinctUntilChanged, repeatWhen, takeWhile, tap } from 'rxjs/operators';
import { HttpService, SchemaType } from 'src/app/services/http.service';
import { PopupService } from 'src/app/services/popup.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-csw-validation',
  templateUrl: './csw-validation.component.html',
  styleUrls: ['./csw-validation.component.scss']
})
export class CswValidationComponent implements OnInit {

  urlCsw = "";
  urlCswChanged: Subject<string> = new Subject<string>();
  searchingCsw = false;


  httpGetCapabilities: Subscription = new Subscription;
  httpGetDescribeFeatureType: Subscription = new Subscription;
  httpGetFeature: Subscription = new Subscription;

  // loading flags
  loadingGetCapabilities = false;
  loadingDescribeRecord = false;
  loadingGetRecord = false;
  loadingGetRecordById = false;


  // errors
  errorsGetCapabilities: any[] = [];
  errorsDescribeRecord: any[] = [];
  errorsGetRecord: any[] = [];
  errorsGetRecordById: any[] = [];

  // result description
  textGetCapabilities = ""
  textDescribeRecord = ""
  textGetRecord = ""
  textGetRecordById = ""

  statusGetCapabilities = ""
  statusDescribeRecord = ""
  statusGetRecord = ""
  statusGetRecordById = ""

  constructor(
    private toastService: ToastService,
    private http: HttpService,
    private popupService: PopupService,
    private ngxXml2jsonService: NgxXml2jsonService

  ) {
    this.urlCswChanged.pipe(
      debounceTime(600),
      distinctUntilChanged()
    ).subscribe(() => {
      //this.resetSearching()
      this.parseGetCapabilities(this.urlCsw)
    })
  }

  ngOnInit(): void {
  }

  parseGetCapabilities(url: string) {

    if (url == "" || url == " "){
      return
    }
    this.resetSearching()
    this.startloadingAll()

    url = this.http.corsUrl + url

    if (!url.includes("?")) {
      url = url + "?SERVICE=CSW&REQUEST=GetCapabilities"
    }

    this.http.getCapabilities(url).subscribe(
      (dataXML: any) => {

        const parser = new DOMParser();
        const xml = parser.parseFromString(dataXML, 'text/xml');
        const obj = this.ngxXml2jsonService.xmlToJson(xml) as any;
        console.log(obj)

        let capabilities = obj.CSW_Capabilities || obj['csw:Capabilities']

        // get version
        let version = findAllByKey(capabilities, "ows:ServiceTypeVersion")[0]
        console.log("VERSIONS", version)

        //get operations
        let operations = findAllByKey(capabilities, "ows:Operation")
        console.log("OPERATIONS", operations)

        let outputFormat = ""
        let schemaLanguage = ""
        let outputSchema = ""
        for (let operation of operations) {

          if (operation['@attributes']['name'] === 'DescribeRecord') {
            let parameters = operation['ows:Parameter'] as any[]
            console.log("PARAMETERS: ", parameters)

            for (let parameter of parameters) {

              if (parameter['@attributes']['name'] === 'outputFormat') {
                outputFormat = parameter['ows:Value']
              }

              if (parameter['@attributes']['name'] === 'schemaLanguage') {
                schemaLanguage = parameter['ows:Value'][0]
              }

              if (parameter['@attributes']['name'] === 'outputSchema') {
                outputSchema = parameter['ows:Value'][0]
              }
            }
          }

          console.log(outputFormat, schemaLanguage, outputSchema)
        }

        this.validateGetCapabilities(url)
        this.validateDescribeRecord(url, version, outputFormat, outputSchema, schemaLanguage)
        this.validateGetRecord(url)
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
      "&SERVICE=CSW" +
      "&REQUEST=GetCapabilities"

    //console.log("GET_CAPABILITIES URL: ", urlGetCapabilities.replace("http://192.168.1.63:3002/", ""))
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
    )*/

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

            if (data.status == "SUCCESS") {

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

  validateDescribeRecord(url: string, version: string, outputFormat: string, outputSchema: string, schemaLanguage: string) {
    let baseUrl = url.split("?")[0]
    let urlDescribeRecord = baseUrl +
      `?SERVICE=CSW` +
      `&REQUEST=DescribeRecord` +
      `&version=${version}` +
      `&outputFormat=${outputFormat}` +
      `&namespace=${outputSchema}` +
      `&schemaLanguage=http://www.w3.org/XML/Schema`


    //console.log("DESCRIBE_RECORD URL: ", urlDescribeRecord)
    /*
    this.httpGetDescribeFeatureType = this.http.validateXML(urlDescribeRecord).subscribe(
      (data: any) => {
        console.log("VALIDATION DESCRIBE_FEATURE_TYPE: ", data)

        if (data.isValid === false) {
          this.errorsDescribeRecord = data.errors
        } else {
          this.textDescribeRecord = "Brak błędów"
        }

        this.loadingDescribeRecord = false;
      },
      error => {
        this.textDescribeRecord = "BŁĄD PODCZAS WCZYTYWANIA"
        this.loadingDescribeRecord = false;
      }
    )*/

    urlDescribeRecord = urlDescribeRecord.replace(this.http.corsUrl, "")
    this.httpGetDescribeFeatureType = this.http.validateXml(urlDescribeRecord).subscribe(
      (data: any) => {
        this.http.getValidationStatus(data['task_id']).pipe(
          tap((result: any) => this.statusDescribeRecord = result.status),
          tap(() => this.loadingDescribeRecord = true),
          repeatWhen(
            (s) => s.pipe(
              takeWhile(() => (this.statusDescribeRecord !== "SUCCESS" && this.statusDescribeRecord !== "FAILURE")),
              delay(5000),
            )
          ),

        ).subscribe(
          data => {
            console.log(data)

            if (data.status == "SUCCESS") {

              if (data.result.valid) {
                this.textDescribeRecord = "Brak błędów"
              } else {
                this.errorsDescribeRecord = [data.result.msg]
              }

              this.loadingDescribeRecord = false;
            } else if (data.status == "FAILURE") {

              this.textDescribeRecord = "Błąd pliku podczas walidacji"
              this.loadingDescribeRecord = false;

            }
          },
          error => {
            this.textDescribeRecord = "Brak połączenia z walidatorem"
          }
        )
      }
    )

  }

  validateGetRecord(url: string) {
    this.loadingGetRecord = true
    //url = url.replace("http://192.168.1.63:3002/", "")

    /*
    this.http.validateCswGetRecords(url).subscribe(
      (data: any) => {
        if (data.isValid === false) {
          this.errorsGetRecord = data.errors
        } else {
          this.textGetRecord = "Brak błędów"
        }

        this.loadingGetRecord = false

        let id = data.file_uuid
        this.validateGetRecordById(url, id)
      },
      error => {
        this.textGetRecord = "BŁĄD PODCZAS WCZYTYWANIA"
        this.loadingGetRecord = false
      })*/

    url = url.replace(this.http.corsUrl, "")
    this.httpGetFeature =  this.http.validateXml(url, SchemaType.CSW_GET_RECORD).subscribe(
      (data: any) => {
        this.http.getValidationStatus(data['task_id']).pipe(
          tap((result: any) => this.statusGetRecord = result.status),
          tap(() => this.loadingGetRecord = true),
          repeatWhen(
            (s) => s.pipe(
              takeWhile(() => (this.statusGetRecord !== "SUCCESS" && this.statusGetRecord !== "FAILURE")),
              delay(5000),
            )
          ),

        ).subscribe(
          data => {
            console.log(data)

            if (data.status == "SUCCESS") {

              if (data.result.valid) {
                this.textGetRecord = "Brak błędów"
                this.textGetRecordById = "Brak błędów"
                this.errorsGetRecordById = []
              } else {
                this.errorsGetRecord = [data.result.msg]
                this.errorsGetRecordById = []
                this.textGetRecordById = "Brak błędów"

              }

              this.loadingGetRecord = false;
            } else if (data.status == "FAILURE") {

              this.textGetRecord = "Błąd pliku podczas walidacji"
              this.textGetRecordById = "Błąd pliku podczas walidacji"

              this.loadingGetRecord = false;

            }
          },
          error => {
            this.textGetRecord = "Brak połączenia z walidatorem"
            this.textGetRecordById = "Brak połączenia z walidatorem"

          }
        )
      }
    )
  }

  validateGetRecordById(url: string, id: string) {
    this.loadingGetRecordById = true

    let baseUrl = url.split("?")[0]
    let urlGetRecordById = baseUrl +
      `?SERVICE=CSW` +
      `&REQUEST=GetRecordById` +
      `&outputschema=http://www.isotc211.org/2005/gmd` +
      `&Elementsetname=full` +
      `&Id=${id}` +
      `&VERSION=2.0.2`

    /*
    this.http.validateXML(urlGetRecordById).subscribe(
      (data: any) => {
        if (data.isValid === false) {
          this.errorsGetRecordById = data.errors
        } else {
          this.textGetRecordById = "Brak błędów"
        }

        this.loadingGetRecordById = false

      },
      error => {
        this.textGetRecordById = "BŁĄD PODCZAS WCZYTYWANIA"
        this.loadingGetRecordById = false
      })*/
  }


  resetSearching() {
    this.searchingCsw = false;
    this.closeLoadingAll();

    this.errorsDescribeRecord = [];
    this.errorsGetCapabilities = [];
    this.errorsGetRecord = [];
    this.errorsGetRecordById = [];

    this.textDescribeRecord = "";
    this.textGetCapabilities = "";
    this.textGetRecord = "";
    this.textGetRecordById = "";

    this.httpGetCapabilities.unsubscribe()
    this.httpGetDescribeFeatureType.unsubscribe()
    this.httpGetFeature.unsubscribe()
  }

  cancelSearching() {
    this.closeLoadingAll();
    this.resetSearching()
    this.urlCsw = "";
    this.cswInputChange();

  }

  cswInputChange() {
    this.urlCswChanged.next(this.urlCsw)
  }

  startloadingAll() {
    this.loadingGetCapabilities = true;
    this.loadingDescribeRecord = true;
  }

  closeLoadingAll() {
    this.loadingGetCapabilities = false;
    this.loadingDescribeRecord = false;
  }

  showValidationError(error: string) {
    this.popupService.showError(error)
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