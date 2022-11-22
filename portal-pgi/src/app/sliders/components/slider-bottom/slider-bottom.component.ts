import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { SlidersComponent } from '../../sliders.component';

@Component({
  selector: 'app-slider-bottom',
  templateUrl: './slider-bottom.component.html',
  styleUrls: ['./slider-bottom.component.scss'],
  animations: [
    trigger('arrowVisibilityState', [
      state('visible', style({ transform: 'translate3d(0,0,0) rotate(90deg)' })),
      state('hidden', style({ transform: 'translate3d(0, 50px, 0) rotate(90deg)' })),
      transition('* <=> *', animate('300ms ease-out')),
    ])
  ]
})
export class SliderBottomComponent extends SlidersComponent implements OnInit {

 
  isArrowOpen = false
  isArrowVisible: boolean = false;
  arrowVisibilityState = "visible"


  constructor() {
    super()

    this.sliderService.bottomSliderArrowVisible.subscribe(isVisible => {
      this.isArrowVisible = isVisible
      this.isArrowOpen = false
      this.arrowVisibilityState = isVisible ? "visible" : "hidden"  
    })
  }

  ngOnInit(): void {
  }

  toggleBottomSlider() {
    this.sliderService.toggleBottomSlider()
    this.isArrowOpen = !this.isArrowOpen
  }

  zoomIn() {
    //this.mapService.zoomIn()
  }


  zoomOut() {
    //this.mapService.zoomOut()
  }

  centerMap() {
    //this.mapService.panTo([361000.1344, 363000.9189])
  }

}
