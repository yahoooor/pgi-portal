import { Component, OnInit } from '@angular/core';
import WMSCapabilities from 'ol/format/WMSCapabilities';
import { Subject } from 'rxjs/internal/Subject';
import { HttpService } from 'src/app/services/http.service';
import { MapService } from 'src/app/services/map.service';

import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { LayerGroupLegend, LayerLegend, WmsChildLayers, WmsLayers, WmsLayersLegend } from 'src/app/consts/layers';
import ImageLayer from 'ol/layer/Image';
import ImageWMS from 'ol/source/ImageWMS';
import LayerGroup from 'ol/layer/Group';
import Layer from 'ol/layer/Layer';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import { GeoJSON, WFS, GML } from 'ol/format';

import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Stroke, Circle, RegularShape } from 'ol/style';
import Style from 'ol/style/Style';
import Vector from 'ol/source/Vector';
import Fill from 'ol/style/Fill';
import GML32 from 'ol/format/GML32';
import GML3 from 'ol/format/GML3';
import { Projection } from 'ol/proj';
import Source from 'ol/source/Source';
import { FeatureLike } from 'ol/Feature';
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { NgxXml2jsonService } from 'ngx-xml2json';
import { ThrowStmt } from '@angular/compiler';
import { ToastService } from 'src/app/services/toast.service';
import CircleStyle from 'ol/style/Circle';


@Component({
  selector: 'app-wfs',
  templateUrl: './wfs.component.html',
  styleUrls: ['./wfs.component.scss']
})
export class WfsComponent implements OnInit {


  searchingWfs = false;
  hidden = true

  urlWfs = ""
  urlWfsChanged: Subject<string> = new Subject<string>();
  wfsGroupTitle = ""
  wfsLayers: any[] = []


  value = false
  selectedLayers: any = {}

  constructor(private http: HttpService,
    private toastService: ToastService,
    private ngxXml2jsonService: NgxXml2jsonService,
    private mapService: MapService) {
    this.urlWfsChanged.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.resetSearching()
      this.parseWfs(this.urlWfs)
    })
  }

  ngOnInit(): void {

  }

  wfsInputChange() {
    this.urlWfsChanged.next(this.urlWfs)
  }

  addLayers() {
    console.log(this.selectedLayers)

    let index = 0
    let childLayers: LayerLegend[] = []
    let childMapLayers: Layer[] = []

    // iterate over selected layers
    Object.entries(this.selectedLayers).forEach(([key, layer]: any) => {

      let color = `rgba(${[1, 2, 3].map(x => Math.random() * 256 | 0)}, 1.0)`
      // layer to legend
      let childLayer: LayerLegend = {
        name: layer.Title,
        checked: true,
        expanded: false,
        parentIndex: WmsLayersLegend.length,
        index: index++,
        color: color,
        exists: false

        //legendUrl: layer.Style[0].LegendURL[0].OnlineResource
      }
      childLayers.push(childLayer)

      // layer to map 
      let outputFormat = this.getOutputFormat(layer)
      let srsName = "EPSG:3857" //this.getSrsName()
      let version = this.getVersion()

      // get all crs


      let url = this.http.corsUrl + this.urlWfs.split("?")[0] +
        `?SERVICE=WFS` +
        `&REQUEST=getFeature` +
        `&VERSION=2.0.0` +
        `&srsName=EPSG:4326` +
        `&typename=${layer.Name}` + 
        `&outputFormat=${outputFormat}`

      
      let that = this
      let isPolygon = false;
      var vectorSource = new Vector({
        format: new WFS({
          //featureNS: 'ms',
          version: '2.0.0',
          gmlFormat: new GML32({
            srsName: 'EPSG:4326'
          }),
        }),
        loader: function (extent: any, resolution, projection, success: any, failure: any) {

          that.http.getCapabilities(url).subscribe(
            (dataXML: any) => {
              //dataXML = dataXML.replace("<ms:msGeometry>", "<ns:geometry>")
              console.log(dataXML)
              var features = vectorSource.getFormat()?.readFeatures(dataXML, {
                featureProjection: 'EPSG:3857',
                dataProjection: "EPSG:4326",
              }) as Feature<Geometry>[];

              console.log(features)

              if (features.length > 0) {
                console.log(features[0].getGeometry()?.getType() )
                isPolygon = features[0].getGeometry()?.getType() == 'Polygon'
                console.log(isPolygon)
              }

              vectorSource.addFeatures(features);
              success(features);
            },
            error => {
              that.resetSearching()
              vectorSource.removeLoadedExtent(extent);
              failure();
            }
          )
        },

        strategy: bboxStrategy,


      });

      console.log(color)
      console.log(vectorSource)

      let WFSLayer = new VectorLayer(
        {
          source: vectorSource,
          style: function(feature) {
            
            let isPolygon = feature.getGeometry()?.getType() == 'Polygon'

            if (isPolygon) {
              return new Style({
                fill: undefined,
                stroke: new Stroke({
                  color: color,
                  width: 3
                }),
              })
            }

            return new Style({
              image: new RegularShape({
                fill: new Fill({
                  color: 'rgba(255,255,255, 0.5)'
                }),
                stroke: new Stroke({
                  color: color,
                  width: 3
                }),
                points: 4,
                radius: 6,
                angle: Math.PI / 4,
              }),
            })
          }
      })

      childMapLayers.push(WFSLayer)

    })

    // adding new layers a a group to legend
    let newLayerGroup: LayerGroupLegend = {
      name: this.wfsGroupTitle ? this.wfsGroupTitle : "WFS",
      checked: true,
      expanded: false,
      childLayers: childLayers,
      index: WmsLayers.length
    }

    let existingLayerGroup = this.checkLayerGroupExists(newLayerGroup)


    // check if exits and add

    if (existingLayerGroup) {
      //let filteredNewLayerGroup = this.filterChildLayers(newLayerGroup)
  
      this.toastService.showMessageInfo("Ta grupa warstw już istnieje. Usuń istniejącą aby dodać ponownie.")

    } else {

      WmsLayersLegend.push(newLayerGroup)
      WmsChildLayers.push(childMapLayers)

      // adding new layers as a group to map
      let wmsLayerGroup = new LayerGroup({
        layers: WmsChildLayers[WmsLayers.length]
      })
      wmsLayerGroup.setProperties({
        name: this.wfsGroupTitle ? this.wfsGroupTitle : "WFS",
      })


      WmsLayers.push(wmsLayerGroup)
      this.mapService.map.addLayer(wmsLayerGroup)

      this.toastService.showMessageSuccess("Dodano warstwy")
    }

    // return all layers
    this.mapService.map.getLayers().forEach(layer => {
      console.log(layer)
    })
  }
  getVersion() {
    //throw new Error('Method not implemented.');
  }
  getSrsName() {
    //throw new Error('Method not implemented.');
  }
  getOutputFormat(layer: any) {
    
    let outputFormats = layer.OutputFormats
    let formats = outputFormats['Format'] || outputFormats['wfs:Format']
    console.log(formats)
    // if there are multiple formats
    if (Array.isArray(formats)) {

      let backupFormat = 'text/xml; subtype=gml/3.2.1'

      for (let format of formats) {
        if (format.toLowerCase() == 'text/xml; subtype=gml/3.2.1'){
          return format
        } else if ((format.toLowerCase() == 'text/xml; subtype=gml/3.1.1')) {
          return format
        } else {
          backupFormat = format

          //return backupFormat
        }
      }

      return backupFormat

    } 
    // if there is one format
    else {
      // return output format string 
      if (formats !== '') {
        return formats
      }
      else {
        return 'text/xml; subtype=gml/3.2.1'
      }
    }
    
    //throw new Error('Method not implemented.');
  }

  parseWfs(url: string) {
    this.searchingWfs = true

    //url = url.split("?")[0]
    url = this.http.corsUrl + url

    if (!url.toLowerCase().includes("getcapabilities")) {
      console.log("ADDING CAPABILITIES TO URL")

      url = url.split("?")[0] + "?SERVICE=WFS&REQUEST=getCapabilities"
    }

    // this.urlWfs = url


    this.http.getCapabilities(url).subscribe(
      (dataXML: any) => {

        const parser = new DOMParser();
        const xml = parser.parseFromString(dataXML, 'text/xml');
        const obj = this.ngxXml2jsonService.xmlToJson(xml) as any;
        console.log(obj)

        let capabilities = obj.WFS_Capabilities || obj['wfs:WFS_Capabilities']
        let featureTypeList = capabilities.FeatureTypeList || capabilities['wfs:FeatureTypeList']
        let featureList = featureTypeList.FeatureType || featureTypeList['wfs:FeatureType']

        if (!Array.isArray(featureList)){
          featureList = [featureList]
        }

        for (let featureType of featureList) {
          featureType.isSelected = false // add for checkbox

          Object.keys(featureType).forEach(key => {
            if (key.includes("wfs:")) {
              let tempKey = key.replace("wfs:", "")
              featureType[tempKey] = featureType[key]
              delete featureType[key]
            }
          })

          this.wfsLayers.push(featureType)
        }

        // set title to layer group
        this.wfsGroupTitle = capabilities['ows:ServiceIdentification']['ows:Title']
        this.searchingWfs = false
      },

      error => {
        this.resetSearching()
        this.searchingWfs = false
      }
    )

  }

  resetSearching() {
    this.wfsLayers = []
    this.wfsGroupTitle = ""
    this.selectedLayers = []
    this.searchingWfs = false;
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

  onLayerCheckboxChange(event: any, layer: any) {
    if (event.checked) {
      this.selectedLayers[layer.Name] = layer
    } else {
      delete this.selectedLayers[layer.Name]
    }
  }
}

function findAllByKey(obj: any, keyToFind: string) {
  return Object.entries(obj)
    .reduce((acc, [key, value]: any): any => (key === keyToFind)
      ? acc.concat(value)
      : (typeof value === 'object')
        ? acc.concat(findAllByKey(value, keyToFind))
        : acc
      , [])
}




