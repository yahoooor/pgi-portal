import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PopupService {

  validationError$ = new Subject<string>()


  constructor() { }


  showError(error: string) {
    this.validationError$.next(error)
  }
}
