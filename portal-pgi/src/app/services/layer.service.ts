import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LayerService {

  public isLoading$ = new BehaviorSubject<boolean>(false);

  constructor() { }
}
