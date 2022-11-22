import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
  
})
export class ToastService {
  
  messageSuccess$ = new Subject<string>()
  messageError$ = new Subject<string>()
  messageInfo$ = new Subject<string>()



  constructor() { }

  showMessageSuccess(text: string) {
    this.messageSuccess$.next(text)
  }

  showMessageError(text: string) {
    this.messageError$.next(text)
  }

  showMessageInfo(text: string) {
    this.messageInfo$.next(text)
  }
}
