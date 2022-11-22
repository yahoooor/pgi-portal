import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class SliderService {

  constructor() {
  }

  rightSliderState$ = new BehaviorSubject<string>('out')
  bottomSliderState$ = new BehaviorSubject<string>('out')

  bottomSliderArrowVisible = new BehaviorSubject<boolean>(false)
  leftSliderArrowVisible = new BehaviorSubject<boolean>(false)

  toggleRightSlider() {
    let newState = this.rightSliderState$.value === 'out' ? 'in' : 'out'
    this.rightSliderState$.next(newState)
  }

  toggleBottomSlider() {
    let newState = this.bottomSliderState$.value === 'out' ? 'in' : 'out'
    this.bottomSliderState$.next(newState)
  }

  openRightSlider() {
    this.rightSliderState$.next('in')
  }

  closeRightSlider() {
    this.rightSliderState$.next('out')
  }

  openBottomSlider() {
    this.bottomSliderState$.next('in')
  }

  closeBottomSlider() {
    this.bottomSliderState$.next('out')
  }

}
