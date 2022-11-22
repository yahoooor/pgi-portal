import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SlidersComponent } from './sliders.component';
import { ButtonModule } from 'primeng/button';
import { SliderBottomComponent } from './components/slider-bottom/slider-bottom.component';
import {DividerModule} from 'primeng/divider';
import { BrowserModule } from '@angular/platform-browser';
import { SliderRightComponent } from './components/slider-right/slider-right.component';
import { SliderBottomContentModule } from '../modules/slider-bottom-content/slider-bottom-content.module';
import { ArrowUpComponent } from '../shared/arrow-up/arrow-up.component';
import { ArrowRightComponent } from '../shared/arrow-right/arrow-right.component';


@NgModule({
  declarations: [
    SlidersComponent,
    SliderBottomComponent,
    SliderRightComponent,
    ArrowUpComponent,
    ArrowRightComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    ButtonModule,
    DividerModule,
    SliderBottomContentModule,

  ],
  exports: [
    SlidersComponent,
    SliderBottomComponent,
    SliderRightComponent,
  ]
})


export class SlidersModule {
  constructor() {
    /*SliderServiceLocator.injector = Injector.create(
      Object.keys(services).map(key => ({
        provide: services[key].provide,
        useClass: services[key].provide,
        deps: services[key].deps
      }))
    );*/
  }
}
