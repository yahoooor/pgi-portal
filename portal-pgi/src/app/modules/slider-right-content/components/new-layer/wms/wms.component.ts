import { Component, Input, OnInit } from '@angular/core';
import WMSCapabilities from 'ol/format/WMSCapabilities';
import { Subject } from 'rxjs/internal/Subject';
import { HttpService } from 'src/app/services/http.service';
import { MapService } from 'src/app/services/map.service';

import { concatMap, debounceTime, distinctUntilChanged, map, tap } from 'rxjs/operators';
import { LayerGroupLegend, LayerLegend, WmsChildLayers, WmsLayers, WmsLayersLegend } from 'src/app/consts/layers';
import ImageLayer from 'ol/layer/Image';
import ImageWMS from 'ol/source/ImageWMS';
import LayerGroup from 'ol/layer/Group';
import Layer from 'ol/layer/Layer';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';


import { ToastService } from 'src/app/services/toast.service';
import { forkJoin, from } from 'rxjs';
import { LayerService } from 'src/app/services/layer.service';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-wms',
  templateUrl: './wms.component.html',
  styleUrls: ['./wms.component.scss']
})
export class WmsComponent implements OnInit {
  @Input() url: string | null = null

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
    private layerService: LayerService,
    private httpClient: HttpClient,
    private mapService: MapService) {
    this.urlWmsChanged.pipe(
      tap(url => {
        //console.log(url)
      }),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => this.getWmsCapabilities(this.urlWms))
  }

  ngOnInit(): void {
    this.initWmsLayers()
    console.log(this.url)
    if (this.url && this.url.includes("wms")) {
      setTimeout(() => {
        this.urlWms = this.url!
        this.getWmsCapabilities(this.url!)
      }, 0);
    }
  }

  private initWmsLayers() {
    this.layerService.isLoading$.next(true)
    let wmsLinks: string[] = []




    const parser = new WMSCapabilities();

    this.httpClient.get<string[]>('./assets/portal.json').subscribe(links => {
      wmsLinks = links

      from(wmsLinks).pipe(
        concatMap((wmsLink, index) =>
          this.http.getCapabilities(wmsLink).pipe(
            map((data) => ({
              data, wmsLink, index
            }))
          )
        )
      ).subscribe({
        next: (r) => {
          console.log(r.wmsLink)
          let wmsData = parser.read(r.data);
          let wmsGroupTitle = wmsData.Service.Title;
          let wmsLayers = wmsData.Capability.Layer.Layer as any[];
          if (wmsLayers) {
            console.log(wmsData)
            wmsLayers.forEach(item => item.isSelected = false);

            const enabledParent = r.index === 0 ? true : false
            const enabled = r.index === 0 ? true : false

            this.addLayers(wmsLayers, r.wmsLink, wmsGroupTitle, enabledParent, enabled, false, r.index === 0 ? true : false);

          }
        },
        error: (error) => {
          this.searchingWms = false;
          this.layerService.isLoading$.next(false)
          console.error('Error loading WMS:', error);
        },
        complete: () => {
          this.layerService.isLoading$.next(false)
          console.log('All WMS layers processed.');
        }
      });

    });




  }

  wmsInputChange() {
    this.urlWmsChanged.next(this.urlWms)
  }

  getWmsCapabilities(url: string) {
    this.searchingWms = true
    this.resetSearching()

    url = this.http.corsUrl + url.trim()

    if (!url.toLowerCase().includes("getcapabilities")) {


      url = url.split("?")[0] + "?SERVICE=WMS&REQUEST=getCapabilities"
    }


    const parser = new WMSCapabilities();
    this.http.getCapabilities(url).subscribe(
      (data: any) => {
        let wmsData = parser.read(data)
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

  addLayers(layers: any, urlWms: string, wmsGroupTitle: string, enabledParent = true, enabled = true, notification = true, expandedParent = false) {

    let index = 0
    let childLayers: LayerLegend[] = []
    let childMapLayers: Layer[] = []

    Object.entries(layers).forEach(([key, layer]: any) => {
      // layer to legend

      let legendUrl = undefined
      if (layer.Style && layer.Style.length > 0) {
        if (layer.Style[0].LegendURL && layer.Style[0].LegendURL && layer.Style[0].LegendURL.length > 0) {
          legendUrl = layer.Style[0].LegendURL[0].OnlineResource
        }
      }

      let childLayer: LayerLegend = {
        name: layer.Title,
        checked: enabled,
        expanded: false,
        parentIndex: WmsLayersLegend.length,
        index: index++,
        legendUrl: legendUrl
      }
      childLayers.push(childLayer)

      // layer to map 
      let layerUrl = urlWms.toLowerCase().split("?service")[0]

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
        'name': layer.Name,
        title: layer.Title
      })
      newLayer.setVisible(childLayer.checked)
      childMapLayers.push(newLayer)
    });

    // adding new layers a a group to legend
    let newLayerGroup: LayerGroupLegend = {
      name: wmsGroupTitle + " [WMS]",
      checked: enabledParent,
      expanded: expandedParent,
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
        layerName: wmsGroupTitle + " [WMS]"
      })

      WmsLayers.push(wmsLayerGroup)
      wmsLayerGroup.setVisible(enabledParent)
      this.mapService.map.addLayer(wmsLayerGroup)


      if (notification) {
        this.toast.showMessageSuccess("Dodano warstwy WMS: " + wmsGroupTitle)
      }
    }




  }

  resetSearching() {
    this.wmsLayers = []
    this.wmsGroupTitle = ""
    this.selectedLayers = []
    this.searchingWms = false
  }

  cancelSearching() {
    this.resetSearching()
    this.urlWms = ""
    this.wmsInputChange()
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
