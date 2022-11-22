import { Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MapComponent } from './modules/map/map.component';
import { TabsModule } from './modules/slider-right-content/tabs.module';
import { PrimengModule } from './primeng.module';
import { SliderServiceLocator } from './sliders/slider-service-injector';
import { SlidersModule } from './sliders/sliders.module';
import {DialogModule} from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { HighlightModule } from 'ngx-highlightjs';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    PrimengModule,
    SlidersModule,
    TabsModule,
    DialogModule,
    ButtonModule,
    HighlightModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private injector: Injector){    // Create global Service Injector.
    SliderServiceLocator.injector = this.injector;
}
}
