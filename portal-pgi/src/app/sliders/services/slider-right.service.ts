import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { TabComponent } from '../models/tabs-components';

@Injectable({
  providedIn: 'root'
})
export class SliderRightService {

  selectedTab$ = new Subject<TabComponent>();

  public selectTab(tabComponent: TabComponent){
    this.selectedTab$.next(tabComponent)
  }

  constructor() { }
}
