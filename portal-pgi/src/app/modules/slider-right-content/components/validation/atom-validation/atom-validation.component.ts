import { Component, OnInit } from '@angular/core';
import { NgxXml2jsonService } from 'ngx-xml2json';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, delay, distinctUntilChanged, repeatWhen, takeWhile, tap } from 'rxjs/operators';
import { HttpService, SchemaType } from 'src/app/services/http.service';
import { PopupService } from 'src/app/services/popup.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-atom-validation',
  templateUrl: './atom-validation.component.html',
  styleUrls: ['./atom-validation.component.scss']
})
export class AtomValidationComponent implements OnInit {

  urlAtom = "";
  urlAtomChanged: Subject<string> = new Subject<string>();
  searchingAtom = false;


  httpTopAtom: Subscription = new Subscription;
  httpDatasetFeed: Subscription = new Subscription;
  httpOpenSearch: Subscription = new Subscription;

  // loading flags
  loadingTopAtom = false;
  loadingDatasetFeed = false;
  loadingOpenSearch = false;

  // errors
  errorsTopAtom: any[] = [];
  errorsDatasetFeed: any[] = [];
  errorsOpenSearch: any[] = [];

  // result description
  textTopAtom = ""
  textDatasetFeed = ""
  textOpenSearch = ""

  statusTopAtom = ""
  statusDatasetFeed = ""
  statusOpenSearch = ""

  constructor(
    private toastService: ToastService,
    private http: HttpService,
    private popupService: PopupService,
    private ngxXml2jsonService: NgxXml2jsonService

  ) {
    this.urlAtomChanged.pipe(
      debounceTime(600),
      distinctUntilChanged()
    ).subscribe(() => {
      //this.resetSearching()
      this.parseGetCapabilities(this.urlAtom)
    })
  }

  ngOnInit(): void {
  }

  parseGetCapabilities(url: string) {

    if(url == "" || url == " ") {
      return 
    }

    this.startloadingAll()

    url = this.http.corsUrl + url

    this.http.getCapabilities(url).subscribe(
      (dataXML: any) => {

        const parser = new DOMParser();
        const xml = parser.parseFromString(dataXML, 'text/xml');
        const obj = this.ngxXml2jsonService.xmlToJson(xml) as any;
        console.log(obj)

        let links = obj.feed.link
        let alternateUrl = ""
        let openSearchUrl = ""

        for (let link of links) {

          if (link['@attributes']['rel'] === 'alternate') {
            alternateUrl = link['@attributes']['href']
          }

          if (link['@attributes']['rel'] === 'search') {
            openSearchUrl = link['@attributes']['href']
          }
        }
        console.log(alternateUrl)
        console.log(openSearchUrl)

        this.validateTopAtom(url)
        this.validateDatasetFeed(alternateUrl)
        this.validateOpenSearch(openSearchUrl)
      },
      error => {
        this.closeLoadingAll()
        this.toastService.showMessageError("Błąd podczas wczytywania pliku getCapabilities")
      }
    )

  }

  validateTopAtom(url: string) {

    /*
    this.httpTopAtom = this.http.validateAtom(url).subscribe(
      (data: any) => {
        console.log("VALIDATION TOP ATOM: ", data)

        if (data.isValid === false) {
          this.errorsTopAtom = data.errors
        } else {
          this.textTopAtom = "Brak błędów"
        }

        this.loadingTopAtom = false;
      },
      error => {
        this.textTopAtom = "BŁĄD PODCZAS WCZYTYWANIA"
        this.loadingTopAtom = false;
      }
    ) */
    

    url = url.replace(this.http.corsUrl, "")
    this.httpTopAtom = this.http.validateXml(url, SchemaType.ATOM).subscribe(
      (data: any) => {
        this.http.getValidationStatus(data['task_id']).pipe(
          tap((result: any) => this.statusTopAtom = result.status),
          tap(() => this.loadingTopAtom = true),
          repeatWhen(
            (s) => s.pipe(
              takeWhile(() => (this.statusTopAtom !== "SUCCESS" && this.statusTopAtom !== "FAILURE")),
              delay(5000),
            )
          ),

        ).subscribe(
          data => {
            console.log(data)

            if(data.status == "SUCCESS") {

              if (data.result.valid) {
                this.textTopAtom = "Brak błędów"
              } else {
                this.errorsTopAtom = [data.result.msg]
              }

              this.loadingTopAtom = false;
            } else if (data.status == "FAILURE") {

              this.textTopAtom = "Błąd pliku podczas walidacji"
              this.loadingTopAtom = false;

            }
          },
          error => {
            this.textTopAtom = "Brak połączenia z walidatorem"
          }
        )
      }
    )

  }

  validateDatasetFeed(url: string) {

    console.log("DATASET_FED URL: ", url.replace("http://192.168.1.63:3002/", ""))

    /*
    this.httpDatasetFeed = this.http.validateAtom(url).subscribe(
      (data: any) => {
        console.log("VALIDATION DATASET FEED: ", data)

        if (data.isValid === false) {
          this.errorsDatasetFeed = data.errors
        } else {
          this.textDatasetFeed = "Brak błędów"
        }

        this.loadingDatasetFeed = false;
      },
      error => {
        this.textDatasetFeed = "BŁĄD PODCZAS WCZYTYWANIA"
        this.loadingDatasetFeed = false;
      }
    ) */

    url = url.replace(this.http.corsUrl, "")
    this.httpDatasetFeed = this.http.validateXml(url, SchemaType.ATOM).subscribe(
      (data: any) => {
        this.http.getValidationStatus(data['task_id']).pipe(
          tap((result: any) => this.statusDatasetFeed = result.status),
          tap(() => this.loadingDatasetFeed = true),
          repeatWhen(
            (s) => s.pipe(
              takeWhile(() => (this.statusDatasetFeed !== "SUCCESS" && this.statusDatasetFeed !== "FAILURE")),
              delay(5000),
            )
          ),

        ).subscribe(
          data => {
            console.log(data)

            if(data.status == "SUCCESS") {

              if (data.result.valid) {
                this.textDatasetFeed = "Brak błędów"
              } else {
                this.errorsDatasetFeed = [data.result.msg]
              }

              this.loadingDatasetFeed = false;
            } else if (data.status == "FAILURE") {

              this.textDatasetFeed = "Błąd pliku podczas walidacji"
              this.loadingDatasetFeed = false;

            }
          },
          error => {
            this.textDatasetFeed = "Brak połączenia z walidatorem"
          }
        )
      }
    )

  }

  validateOpenSearch(url: string) {
    //console.log("DATASET_FED URL: ", url.replace("http://192.168.1.63:3002/", ""))

    /*
    this.httpOpenSearch = this.http.validateAtomOpenSearch(url).subscribe(
      (data: any) => {
        console.log("VALIDATION OpenSearch: ", data)

        if (data.isValid === false) {
          this.errorsOpenSearch = data.errors
        } else {
          this.textOpenSearch = "Brak błędów"
        }

        this.loadingOpenSearch = false;
      },
      error => {
        this.textOpenSearch = "BŁĄD PODCZAS WCZYTYWANIA"
        this.loadingOpenSearch = false;
      }
    ) */

    url = url.replace(this.http.corsUrl, "").replace("/service/atom/", "/md/service/")
    this.httpOpenSearch = this.http.validateXml(url, SchemaType.OPEN_SEARCH).subscribe(
      (data: any) => {
        this.http.getValidationStatus(data['task_id']).pipe(
          tap((result: any) => this.statusOpenSearch = result.status),
          tap(() => this.loadingOpenSearch = true),
          repeatWhen(
            (s) => s.pipe(
              takeWhile(() => (this.statusOpenSearch !== "SUCCESS" && this.statusOpenSearch !== "FAILURE")),
              delay(5000),
            )
          ),

        ).subscribe(
          data => {
            console.log(data)

            if(data.status == "SUCCESS") {

              if (data.result.valid) {
                this.textOpenSearch = "Brak błędów"
              } else {
                this.errorsOpenSearch = [data.result.msg]
              }

              this.loadingOpenSearch = false;
            } else if (data.status == "FAILURE") {

              this.textOpenSearch = "Błąd pliku podczas walidacji"
              this.loadingOpenSearch = false;

            }
          },
          error => {
            this.textOpenSearch = "Brak połączenia z walidatorem"
          }
        )
      }
    )

  }

  




  resetSearching() {
    this.searchingAtom = false;
    this.urlAtom = "";
    this.closeLoadingAll();

    this.errorsTopAtom = [];
    this.errorsDatasetFeed = [];
    this.errorsOpenSearch = [];


    this.textTopAtom = "";
    this.textDatasetFeed = "";
    this.textOpenSearch = "";


    this.httpTopAtom.unsubscribe()
    this.httpOpenSearch.unsubscribe()
    this.httpDatasetFeed.unsubscribe()

  }

  cancelSearching() {
    this.resetSearching()
    this.urlAtom = ""
    this.atomInputChange();

  }

  atomInputChange() {
    this.urlAtomChanged.next(this.urlAtom)
  }

  startloadingAll() {
    this.loadingDatasetFeed = true;
    this.loadingTopAtom = true;
    this.loadingOpenSearch = true;
  }

  closeLoadingAll() {
    this.loadingDatasetFeed = false;
    this.loadingTopAtom = false;
    this.loadingOpenSearch = false;
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
