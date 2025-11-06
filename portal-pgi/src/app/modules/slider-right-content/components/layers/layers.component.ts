import { Component, ElementRef, OnInit, QueryList } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ViewChildren } from '@angular/core';
import { LayerGroupLegend, LayerLegend, WmsChildLayers, WmsLayers, WmsLayersLegend } from 'src/app/consts/layers';
import { LayerService } from 'src/app/services/layer.service';
import { MapService } from 'src/app/services/map.service';



@Component({
  selector: 'app-layers',
  templateUrl: './layers.component.html',
  styleUrls: ['./layers.component.scss'],
  animations: [
    trigger('toolsPanel', [
      state('active', style({
        transform: 'translateX(0px)'
      })),
      state('inactive', style({
        transform: 'translateX(400px)'
      })),
      state('void', style({
        transform: 'translateX(400px)'
      })),
      transition('* <=> *', animate('400ms ease-in-out')),
    ]),
    trigger('toolsPanelIcon', [
      state('active', style({
        transform: 'rotate(180deg)',
        //background: '#00B798'
      })),
      state('inactive', style({
        transform: 'rotate(0deg)'
      })),
      state('void', style({
        transform: 'rotate(0deg)'
      })),
      transition('* <=> *', animate('400ms ease-in-out')),
    ]),
    trigger('toolsPanelIconBackground', [
      state('active', style({
        background: '#00B798'
      })),
      state('inactive', style({
        background: '#0b6ba7'
      })),
      state('void', style({
        background: '#0b6ba7'
      })),
      transition('* <=> *', animate('400ms ease-in-out')),
    ]),
  ]
})
export class LayersComponent implements OnInit {

  @ViewChildren('toolsPanel')
  toolsPanel!: QueryList<ElementRef>;

  hidden = true;
  isLoading = false;

  layers = WmsLayersLegend

  val1 = "50"

  /*layers = [
    { "layerName": "Layer 1", 'toolsPanel': 'inactive', lockDragging: false},
    { "layerName": "Layer 2", 'toolsPanel': 'inactive', lockDragging: false},
    { "layerName": "Layer 3", 'toolsPanel': 'inactive', lockDragging: false},
  ]*/

  constructor(private layerService: LayerService,
    private mapService: MapService
  ) { }

  ngOnInit(): void {
    this.layerService.isLoading$.subscribe(isLoading => {
      this.isLoading = isLoading;
    })
  }

  toggleLayerGroup(layerGroup: LayerGroupLegend) {
    layerGroup.expanded = layerGroup.expanded ? false : true
  }

  toggleChildLayer(layer: LayerLegend) {
    layer.expanded = layer.expanded ? false : true

  }

  opacitySliderChange(evt: Event, layerLegend: any) {
    //this.layerService.setWmsLayerOpacity(layerLegend)
  }

  layerGroupVisibilityChange(event: any, layerGroup: LayerGroupLegend) {
    layerGroup.checked = event.checked
    WmsLayers[layerGroup.index].setVisible(event.checked)
  }

  childLayerVisibilityChange(event: any, layer: LayerLegend, layerGroup: LayerGroupLegend) {
    WmsChildLayers[layer.parentIndex][layer.index].setVisible(event.checked)

    if (!layerGroup.checked && event.checked) {
      WmsLayers[layerGroup.index].setVisible(event.checked)
      layerGroup.checked = true
    }
  }

  deleteLayerGroup(layerGroup: LayerGroupLegend) {

    this.mapService.map.getLayers().forEach((layer: any) => {
      if (layerGroup.name === layer.values_.name || layerGroup.name === layer.values_.layerName) {
        this.mapService.map.removeLayer(layer)

        let index = layerGroup.index


        WmsLayers.splice(index, 1)
        WmsChildLayers.splice(index, 1)
        WmsLayersLegend.splice(index, 1)

        for (let i = 0; i < WmsLayersLegend.length; i++) {
          WmsLayersLegend[i].index = i
        }
      }
    })
  }

}
