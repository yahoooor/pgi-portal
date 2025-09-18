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
    let wmsLinks = [
      "https://inspire.pgi.gov.pl/ows/services/org.2.d181a629-132b-45b3-81da-10814ff9ce2b_wms?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0",
      "https://inspire.pgi.gov.pl/ows/services/org.2.a6930dcf-64dc-421a-ac59-7d1c7c3a84ad_wms?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0",
      "https://inspire.pgi.gov.pl/ows/services/org.2.75c0da71-b455-41fe-89bb-fae156c62e17_wms?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0",
      "https://inspire.pgi.gov.pl/ows/services/org.2.739e60a6-059d-4246-8e8a-4cb856ad0784_wms?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0",
      "https://inspire.pgi.gov.pl/ows/services/org.2.e02fe07f-91ea-448d-b731-beb982a8f4cb_wms?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0",
      "https://inspire.pgi.gov.pl/ows/services/org.2.72b53987-c36a-47b6-b321-9abe530eca8a_wms?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0",
      "https://inspire.pgi.gov.pl/ows/services/org.2.b3b0a215-31a2-463f-af4c-670d92b68ad2_wms?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0",
      "https://inspire.pgi.gov.pl/ows/services/org.2.9bc9929c-5baf-4bed-8a1a-a58339d34497_wms?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0",
      "https://inspire.pgi.gov.pl/ows/services/org.2.491a443d-42a3-49da-922a-803b81cd76b7_wms?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0",
      "https://inspire.pgi.gov.pl/ows/services/org.2.3b0c28ef-4bab-450e-a2ba-07c1328eb96c_wms?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0",
      "https://inspire.pgi.gov.pl/ows/services/org.2.4286d8f8-bb71-4aba-a2ef-9cf98427d05c_wms?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0",
      "https://inspire.pgi.gov.pl/ows/services/org.2.6344e311-13ab-44db-952a-2c724c463cbc_wms?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0",
      "https://inspire.pgi.gov.pl/ows/services/org.2.b31d2b65-3e95-4f70-bb28-91b0a65bb882_wms?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0",
      "https://inspire.pgi.gov.pl/ows/services/org.2.ee0c16bf-3bd4-4247-b851-9444be5b0421_wms?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0",
      "https://inspire.pgi.gov.pl/ows/services/org.2.9e7f1a45-86ae-44a6-963f-4592720fb03f_wms?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0",
      "https://inspire.pgi.gov.pl/ows/services/org.2.d0968a75-d777-4192-9384-37fff9f1ce5e_wms?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0",
      "https://inspire.pgi.gov.pl/ows/services/org.2.8fa68a12-0a52-461c-a462-09a7348e4122_wms?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0",
      "https://inspire.pgi.gov.pl/ows/services/org.2.7f07948a-7a9f-451c-9e96-adc4731b6e96_wms?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0",
      "https://inspire.pgi.gov.pl/ows/services/org.2.aa52bae1-de73-41a6-970a-e26f72bd504d_wms?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0",
      "https://inspire.pgi.gov.pl/ows/services/org.2.35fdd20b-29ab-466c-9329-7b8d2ef7203f_wms?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0",
      "https://inspire.pgi.gov.pl/ows/services/org.2.d6dd2cff-c33a-4450-8efd-5d95cfd789d6_wms?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0",
      "https://inspire.pgi.gov.pl/ows/services/org.2.d7863626-7899-4852-ba22-af57daa4c5a4_wms?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0",
    ]

    const parser = new WMSCapabilities();

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

          const enabledParent = true
          const enabled = r.index === 0 ? true : false

          this.addLayers(wmsLayers, r.wmsLink, wmsGroupTitle, enabledParent, enabled, false, r.index === 0 ? true : false);

        }
      },
      error: (error) => {
        this.searchingWms = false;
        console.error('Error loading WMS:', error);
      },
      complete: () => {
        this.layerService.isLoading$.next(false)
        console.log('All WMS layers processed.');
      }
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
