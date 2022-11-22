import { LayersComponent } from "src/app/modules/slider-right-content/components/layers/layers.component"
import { NewLayerComponent } from "src/app/modules/slider-right-content/components/new-layer/new-layer.component"
import { ValidationComponent } from "src/app/modules/slider-right-content/components/validation/validation.component"



export interface TabComponent {
    componentName: string
    componentIcon?: string,
    component: any
    tabHeader: string
}



export const COMPONENTS: TabComponent[] = [
    {
        componentName: 'layers',
        componentIcon: './assets/icons/layers.svg',
        component: LayersComponent,
        tabHeader: "WARSTWY"
    },
    {
        componentName: 'new-layer',
        componentIcon: './assets/icons/add.svg',
        component: NewLayerComponent,
        tabHeader: "DODAJ DANE"
    },
    {
        componentName: 'validation',
        componentIcon: './assets/icons/check.svg',
        component: ValidationComponent,
        tabHeader: "WALIDACJA USŁUG"
    },
]
