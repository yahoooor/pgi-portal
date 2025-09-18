import { trigger, state, style, transition, animate, animation, useAnimation } from '@angular/animations';
import { AfterViewInit, Component, HostListener, Input, OnInit } from '@angular/core';
import { Map } from 'ol';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { map, tap, mergeMap, take } from 'rxjs/operators';
import { MapService } from '../services/map.service';
import { SliderRightService } from './services/slider-right.service';
import { SliderService } from './services/slider.service';
import { SliderServiceLocator } from './slider-service-injector';
/*
export const leftSliderAnimation = animation(
  trigger('leftSlideInOut', [
    state('in', style({
      transform: 'translate3d(0,0,0)',
      width: '{{ leftSliderWidth }}px',
    }), 
      {params: {leftSliderWidth: 1920 - 355 }}),
    state('out', style({
      transform: 'translate3d(-355px, 0, 0)'
    })),
    transition('in => out', animate('400ms ease-in-out')),
    transition('out => in', animate('400ms ease-in-out'))
  ]))
*/
export const leftSliderLayout = 350
export const rightSliderLayout = 260

@Component({
  selector: 'app-sliders',
  templateUrl: './sliders.component.html',
  styleUrls: ['./sliders.component.scss'],
  animations: [
    trigger('rightSlideInOut', [
      state('in', style({
        transform: 'translate3d(16%,0,0)'
      })),
      state('out', style({
        transform: 'translate3d(97.9%, 0, 0)'
      })),
      transition('in => out', animate('550ms ease-in-out')),
      transition('out => in', animate('550ms ease-in-out'))
    ]),
    trigger('bottomSlideInOut', [
      state('in', style({
        transform: 'translate3d(0,0,0)'
      })),
      state('out', style({
        transform: 'translate3d(0, 310px, 0)'
      })),
      transition('in => out', animate('550ms ease-in-out')),
      transition('out => in', animate('550ms ease-in-out'))
    ]),
    trigger('leftSlideInOut', [
      state('in', style({
        transform: 'translate3d(0,0,0)',
      })),
      state('out', style({
        transform: 'translate3d(-350px, 0, 0)'
      })),
      transition('in => out', animate('550ms ease-in-out')),
      transition('out => in', animate('550ms ease-in-out'))
    ]),

  ]
})
export class SlidersComponent implements AfterViewInit {

  @Input() isAtom = false;  
  //@Input() map!: Map

  leftSliderWidth = 0
  rightSliderWidth = 0

  resizeObservable$!: Observable<Event>;
  resizeSubscription$!: Subscription

  protected sliderService: SliderService;
  protected sliderRightService: SliderRightService;
  //public mapService: MapService;

  rightSliderState: string = 'out';
  leftSliderState: string = 'out';
  bottomSliderState: string = 'out';

  constructor() {
    
    //this.mapService = SliderServiceLocator.injector.get<MapService>(MapService)
    this.sliderService = SliderServiceLocator.injector.get<SliderService>(SliderService);
    this.sliderRightService = SliderServiceLocator.injector.get<SliderRightService>(SliderRightService);

    this.sliderService.rightSliderState$.pipe(
      map(state => {
        this.rightSliderState = state
        this.rightSliderWidth = state === 'out' ? 0 : rightSliderLayout
      })
    ).subscribe()

    this.sliderService.bottomSliderState$.pipe(
      map(state => { this.bottomSliderState = state })
    ).subscribe()
  }

  ngAfterViewInit(): void {
    this.rightSliderState = this.isAtom ? 'in' : 'out';
  }

  
}
