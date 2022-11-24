import { Component, OnInit } from '@angular/core';
import WMSCapabilities from 'ol/format/WMSCapabilities';
import { Subject } from 'rxjs/internal/Subject';
import { HttpService } from 'src/app/services/http.service';
import { MapService } from 'src/app/services/map.service';

import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { LayerGroupLegend, LayerLegend, WmsChildLayers, WmsLayers, WmsLayersLegend } from 'src/app/consts/layers';
import ImageLayer from 'ol/layer/Image';
import ImageWMS from 'ol/source/ImageWMS';
import LayerGroup from 'ol/layer/Group';
import Layer from 'ol/layer/Layer';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import { GeoJSON, WFS, GML } from 'ol/format';

import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Vector from 'ol/source/Vector';
import GML32 from 'ol/format/GML32';
import { Projection } from 'ol/proj';
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { ToastService } from 'src/app/services/toast.service';
@Component({
  selector: 'app-wms',
  templateUrl: './wms.component.html',
  styleUrls: ['./wms.component.scss']
})
export class WmsComponent implements OnInit {

  searchingWms = false;

  urlWms = ""
  urlWmsChanged: Subject<string> = new Subject<string>();
  wmsGroupTitle = ""
  wmsLayers: any[] = []

  invertedCoordinates = false;

  value = false
  selectedLayers: any = {}

  constructor(private http: HttpService,
    private toast: ToastService,
    private mapService: MapService) {
    this.urlWmsChanged.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => this.getWmsCapabilities(this.urlWms))
  }

  ngOnInit(): void {

  }

  wmsInputChange() {
    this.urlWmsChanged.next(this.urlWms)
  }

  getWmsCapabilities(url: string) {
    this.searchingWms = true
    this.resetSearching()

    url = this.http.corsUrl + url.trim()

    if (!url.toLowerCase().includes("getcapabilities")) {

      console.log("ADDING CAPABILITIES TO URL")

      url = url.split("?")[0] + "?SERVICE=WMS&REQUEST=getCapabilities"
      console.log(url)
    }


    const parser = new WMSCapabilities();
    this.http.getCapabilities(url).subscribe(
      (data: any) => {
        let wmsData = parser.read(data)
        console.log(wmsData)
        this.wmsGroupTitle = wmsData.Service.Title
        this.wmsLayers = wmsData.Capability.Layer.Layer

        this.wmsLayers.forEach(item => item.isSelected = false)

        this.searchingWms = false
      },
      (error: any) => {
        this.searchingWms = false
      }

    )
  }

  addLayers() {

    let index = 0
    let childLayers: LayerLegend[] = []
    let childMapLayers: Layer[] = []

    Object.entries(this.selectedLayers).forEach(([key, layer]: any) => {
      // layer to legend
      console.log(layer)

      let legendUrl = undefined
      if (layer.Style && layer.Style.length > 0) {
        if (layer.Style[0].LegendURL && layer.Style[0].LegendURL && layer.Style[0].LegendURL.length > 0){
          legendUrl = layer.Style[0].LegendURL[0].OnlineResource
        }
      }

      let childLayer: LayerLegend = {
        name: layer.Title,
        checked: true,
        expanded: false,
        parentIndex: WmsLayersLegend.length,
        index: index++,
        legendUrl: legendUrl
      }
      console.log(childLayer)
      childLayers.push(childLayer)

      // layer to map 
      let layerUrl = this.urlWms.toLowerCase().split("?service")[0]

      var newLayer = new ImageLayer({
        source: new ImageWMS({
          url: layerUrl,
          params: {
            'FORMAT': "image/png",
            //'VERSION': "1.1.1",
            "LAYERS": layer.Name,
          }
        }),
        visible: true,
      })
      newLayer.setProperties({
        'name': layer.Name
      })
      childMapLayers.push(newLayer)
    });

    // adding new layers a a group to legend
    let newLayerGroup: LayerGroupLegend = {
      name: this.wmsGroupTitle,
      checked: true,
      expanded: false,
      childLayers: childLayers,
      index: WmsLayers.length
    }

    let existingLayerGroup = this.checkLayerGroupExists(newLayerGroup)

    if (existingLayerGroup) {
      //let filteredNewLayerGroup = this.filterChildLayers(newLayerGroup)

      this.toast.showMessageInfo("Ta grupa warstw już istnieje. Usuń istniejącą aby dodać ponownie.")

    } else {
      WmsLayersLegend.push(newLayerGroup)
      WmsChildLayers.push(childMapLayers)

      // adding new layers as a group to map
      let wmsLayerGroup = new LayerGroup({
        layers: WmsChildLayers[WmsLayers.length]
      })
      wmsLayerGroup.setProperties({
        layerName: this.wmsGroupTitle
      })

      WmsLayers.push(wmsLayerGroup)
      this.mapService.map.addLayer(wmsLayerGroup)

      this.toast.showMessageSuccess("Dodano warstwy")
    }


    // return all layers
    this.mapService.map.getLayers().forEach(layer => {
      console.log(layer)
    })

  }

  resetSearching() {
    this.wmsLayers = []
    this.wmsGroupTitle = ""
    this.selectedLayers = []
    this.searchingWms = false
  }

  onLayerCheckboxChange(event: any, layer: any) {
    if (event.checked) {
      this.selectedLayers[layer.Name] = layer
    } else {
      delete this.selectedLayers[layer.Name]
    }
  }

  checkLayerGroupExists(newLayer: LayerGroupLegend) {
    let existingLayerGroup = undefined;

    WmsLayersLegend.forEach(layerGroup => {
      if (layerGroup.name == newLayer.name) {
        existingLayerGroup = layerGroup
      }
    })

    return existingLayerGroup
  }

}
