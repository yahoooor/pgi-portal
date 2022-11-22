import LayerGroup from 'ol/layer/Group';
import Layer from 'ol/layer/Layer';
import TileLayer from 'ol/layer/Tile';
import SourceOsm from 'ol/source/OSM';
import OSM from 'ol/source/OSM';


export interface LayerLegend {
    name: string,
    checked: boolean,
    expanded: boolean,
    parentIndex: number,
    index: number,
    legendUrl?: string,
    color?: string,
    exists?: boolean
}

export interface LayerGroupLegend {
    name: string,
    checked: boolean,
    childLayers: LayerLegend[],
    expanded: boolean,
    index: number
}

export const BaseLayers: Layer[] = [
    new TileLayer({
        source: new OSM()
    }),
]

export const WmsLayers: LayerGroup[] = []

export const WmsChildLayers: Layer[][] = []

export const WmsLayersLegend: LayerGroupLegend[] = [
    /*{
        name: "Geologia - Geologia",
        checked: false,
        expanded: false,
        index: 0,
        childLayers: [
            {
                name: "Mapa Geologiczna Polski",
                checked: true,
                expanded: false,
                parentIndex: 0,
                index: 0
            },
            {
                name: "Otwory wiertnicze",
                checked: false,
                expanded: false,
                parentIndex: 0,
                index: 1
            }
        ]
    }*/
]



