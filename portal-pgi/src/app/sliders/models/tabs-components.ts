import { LayersComponent } from "src/app/modules/slider-right-content/components/layers/layers.component"
import { NewLayerComponent } from "src/app/modules/slider-right-content/components/new-layer/new-layer.component"
import { ValidationComponent } from "src/app/modules/slider-right-content/components/validation/validation.component"



export interface TabComponent {
    componentName: string
    componentIcon?: string,
    component: any
    tabHeader: string,
    tooltip: string
}



export const COMPONENTS: TabComponent[] = [
    {
        componentName: 'layers',
        componentIcon: './assets/icons-new/layers-icon.svg',
        component: LayersComponent,
        tabHeader: "WARSTWY",
        tooltip: "Warstwy"
    },
    {
        componentName: 'new-layer',
        componentIcon: './assets/icons-new/add-layer-icon.svg',
        component: NewLayerComponent,
        tabHeader: "DODAJ DANE",
        tooltip: "Dodaj dane z usług"
    },
    {
        componentName: 'validation',
        componentIcon: './assets/icons-new/check-mark-icon.svg',
        component: ValidationComponent,
        tabHeader: "WALIDACJA USŁUG",
        tooltip: "Walidacja usług"
    },
]
