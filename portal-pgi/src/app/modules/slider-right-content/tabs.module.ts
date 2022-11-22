import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayersComponent } from './components/layers/layers.component';
import {CheckboxModule} from 'primeng/checkbox';
import {SliderModule} from 'primeng/slider';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NewLayerComponent } from './components/new-layer/new-layer.component';
import { InputTextModule } from 'primeng/inputtext';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { AtomComponent } from './components/new-layer/atom/atom.component';
import { ValidationComponent } from './components/validation/validation.component';
import { AtomValidationComponent } from './components/validation/atom-validation/atom-validation.component';
import { WfsComponent } from './components/new-layer/wfs/wfs.component';
import { WmsComponent } from './components/new-layer/wms/wms.component';
import { CswValidationComponent } from './components/validation/csw-validation/csw-validation.component';
import { WfsValidationComponent } from './components/validation/wfs-validation/wfs-validation.component';
import { WmsValidationComponent } from './components/validation/wms-validation/wms-validation.component';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import { HighlightModule, HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';





@NgModule({
  declarations: [
    LayersComponent,
    NewLayerComponent,
    WmsComponent,
    WfsComponent,
    AtomComponent,
    ValidationComponent,
    AtomValidationComponent,
    WfsValidationComponent,
    WmsValidationComponent,
    CswValidationComponent,
    ],
  imports: [
    CommonModule,
    DragDropModule,
    CheckboxModule,
    SliderModule,
    ReactiveFormsModule,
    FormsModule,
    DropdownModule,
    InputTextModule,
    AccordionModule,
    ButtonModule,
    ProgressSpinnerModule,
    HighlightModule
  ],
  exports: [
    LayersComponent,
    NewLayerComponent
  ],
  providers: [
    {
      provide: HIGHLIGHT_OPTIONS,
      useValue: {
        coreLibraryLoader: () => import('highlight.js/lib/core'),
        //lineNumbersLoader: () => import('highlightjs-line-numbers.js'), // Optional, only if you want the line numbers
        languages: {
          typescript: () => import('highlight.js/lib/languages/typescript'),
          css: () => import('highlight.js/lib/languages/css'),
          xml: () => import('highlight.js/lib/languages/xml'),

        },
        themePath: 'path-to-theme.css' // Optional, and useful if you want to change the theme dynamically
      }
    }
  ],
})
export class TabsModule { }
