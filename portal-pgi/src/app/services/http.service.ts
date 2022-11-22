import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { catchError, delay, repeatWhen, takeWhile, tap, timeout } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http: HttpClient) { }

  corsUrl = "" // "http://192.168.1.63:3002/"


  getCapabilities(url: string) {

    if (!url.includes("192.168.1")) {
      url = url //`https://fast-dawn-89938.herokuapp.com/` + url
    }

    return this.http.get(url, { responseType: 'text' })

    //return this.http.get(`https://fast-dawn-89938.herokuapp.com/` + url, {responseType: 'text'})
  }

  downloadFile(url: string) {
    url = this.corsUrl + url
    return this.http.get(url, { responseType: 'blob' })
  }

  async getFileSize(url: any) {
    let contentSize: any
    await fetch(this.corsUrl + url)
      .then(async (rawResponse) => {
        contentSize = rawResponse.headers.get('content-length')
        console.log(contentSize)
      })

    return contentSize
  }
  /*
  validateXML(url: string) {

    url = url.replace("http://192.168.1.63:3002/", "")
    let body = {
      "url": url
    }

    return this.http.post(`${environment.backendUrl}/xml`, body)
      .pipe(
        timeout(1000 * 9000),
      )
  }

  validateCswGetRecords(url: string) {
    let body = {
      "url": url
    }

    return this.http.post(`${environment.backendUrl}/cswGetRecords`, body)
      .pipe(
        timeout(1000 * 9000),
      )
  }

  validateAtom(url: string) {
    let body = {
      "url": url
    }

    return this.http.post(`${environment.backendUrl}/atom`, body)
    .pipe(
      timeout(1000 * 9000),
    )
  }

  validateAtomOpenSearch(url: string) {
    let body = {
      "url": url,
      "isOpenSearch": true
    }

    return this.http.post(`${environment.backendUrl}/atom`, body)
    .pipe(
      timeout(1000 * 9000),
    )
  }
*/

  validateXml (url: string) {

    let body = {
      "url": url,
    }

    return this.http.post(`/api-backend/xml/validate`, body)
    
  }

  getValidationStatus(taskId: string) {
    
    return this.http.get(`/api-backend/xml/result/` + taskId)
  }
}
