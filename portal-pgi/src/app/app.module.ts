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
import { MapPopupComponent } from './modules/map/map-popup/map-popup.component';
import { AccordionModule } from 'primeng/accordion';
import { PortalComponent } from './portal/portal.component';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    MapPopupComponent,
    PortalComponent
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
    HighlightModule,
    AccordionModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private injector: Injector){    // Create global Service Injector.
    SliderServiceLocator.injector = this.injector;
}
}
