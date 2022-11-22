import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SliderBottomContentComponent } from './slider-bottom-content.component';
import {TableModule} from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


@NgModule({
  declarations: [
    SliderBottomContentComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    BrowserAnimationsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
  ],
  exports: [
    SliderBottomContentComponent,
  ],
  providers: []
})
export class SliderBottomContentModule { }
