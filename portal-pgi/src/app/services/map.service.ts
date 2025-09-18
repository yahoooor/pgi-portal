import Map from 'ol/Map';
import View from 'ol/View';
import { Injectable } from '@angular/core';
import { register } from 'ol/proj/proj4';
import Projection from 'ol/proj/Projection';
import proj4, { Proj } from 'proj4'
import GeoJSON from 'ol/format/GeoJSON';
import * as olProj from 'ol/proj';
import Draw from 'ol/interaction/Draw';
import Overlay from 'ol/Overlay';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { getLength } from 'ol/sphere';


import { BaseLayers } from '../consts/layers';
import { addCoordinateTransforms, addEquivalentProjections } from 'ol/proj';
import { NgxXml2jsonService } from 'ngx-xml2json';
import { Feature } from 'ol';
import { Polygon } from 'ol/geom';





@Injectable({
  providedIn: 'root'
})
export class MapService {

  map!: Map;

  constructor(private ngxXml2jsonService: NgxXml2jsonService) {
    this.setUpMap()
  }

  public showPopupAt?: (coordinate: [number, number], layersInfo: any[]) => void;
  public hidePopup?: () => void;

  private popupHandler: any = null;

  setUpMap() {
    let that = this

    /*
    var proj4326 = new Projection({
      code: 'EPSG:' + 4326,
      //extent: [-121656.5849, -294200.8899, 172945.8815, 277430.8421],
      axisOrientation: "enu"
    });

    
    var proj4326OGC = new Projection({ // srsName from GeoServer GML3 (WFS)
      code: 'urn:x-ogc:def:crs:EPSG:' + 4326,
      axisOrientation: 'enu',
      //extent: [-121656.5849, -294200.8899, 172945.8815, 277430.8421]
    });*/

    // EPSG:2180
    proj4.defs('urn:ogc:def:crs:EPSG::2180',
      '+proj=tmerc +lat_0=0 +lon_0=19 +k=0.9993 +x_0=500000 +y_0=-5300000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +axis=enu');

    // EPSG:2180 odwrócone
    proj4.defs('inverted_EPSG:2180',
      '+proj=tmerc +lat_0=0 +lon_0=19 +k=0.9993 +x_0=500000 +y_0=-5300000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +axis=neu');

    // EPSG:4326
    proj4.defs('inverted_EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs +axis=neu');

    // EPSG:4258
    // proj4.defs("EPSG:4258","+proj=longlat +ellps=GRS80 +no_defs +type=crs");
    proj4.defs("EPSG:4258", "+proj=longlat +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +no_defs");


    register(proj4);
    /*
    addEquivalentProjections(
      [proj4326, proj4326OGC]
    ) */

    //proj4("EPSG:3857", "EPSG:4326")
    var myProjection = new Projection({
      code: 'urn:ogc:def:crs:EPSG::2180',
      extent: [-1000000.26, -1050034.86,
        1937096.39, 1807948.56],
      //axisOrientation: "enu"

    });

    this.map = new Map({
      layers: BaseLayers,
      view: new View({
        //center: [361000.1344, 363000.9189],

        /*
        projection: 'EPSG:4258',
        center: [0, 0],
        extent: [-16.1, 32.88, 40.18, 84.17],
        */

        center: [2400000, 6800000],
        zoom: 6.7,
      }),
      controls: [],
    });

    this.map.getView().on('change:center', () => this.debouncedStoreCurrentPosition());
    this.map.getView().on('change:resolution', () => this.debouncedStoreCurrentPosition());

    // Add map click event
    // Store the handler so we can remove/add it
    this.popupHandler = this.onMapSingleClick.bind(this);
    this.map.on('singleclick', this.popupHandler);

  }

  atomLayers: VectorLayer<any>[] = [];

  public clearAtomLayers() {
    if (this.atomLayers) {
      this.atomLayers.forEach(layer => {
        this.map.removeLayer(layer);
      });
    }
    this.atomLayers = [];
  }

  public setAtomView() {
    this.map.getView().setCenter([2100000, 6700000]);
    this.map.getView().setZoom(6);
  }

  public setAtomLayers(coordsArr: number[][][]): void {
    coordsArr.forEach(coords => {
      const coords2180 = coords.map(c =>
        olProj.transform(c, 'urn:ogc:def:crs:EPSG::4326', this.map.getView().getProjection())
      );
      const polygon = new Polygon([coords2180]);
      const feature = new Feature(polygon);

      const vectorSource = new VectorSource({ features: [feature] });
      const atomLayer = new VectorLayer({ source: vectorSource });
      this.atomLayers?.push(atomLayer)
      this.map.addLayer(atomLayer);
    });
  }

  private onMapSingleClick = async (evt: any) => {
    if (this.isDrawing) return; // Block popup during drawing

    const view = this.map.getView();
    const viewResolution = view.getResolution();
    const layersInfo: any[] = [];

    // Helper to await all fetches
    const fetchPromises: Promise<void>[] = [];

    this.map.getLayers().forEach((l: any) => {

      l.values_?.layers?.forEach((layer: any) => {
        if (typeof layer.getSource === 'function' && layer.state_.visible) {
          const source = layer.getSource();

          // WMS GetFeatureInfo
          if (source && typeof source.getFeatureInfoUrl === 'function') {
            const url = source.getFeatureInfoUrl(
              evt.coordinate,
              viewResolution!,
              view.getProjection(),
              { 'INFO_FORMAT': 'text/xml' }
            );
            if (url) {
              fetchPromises.push(
                fetch(url)
                  .then(response => response.text())
                  .then(xmlText => {
                    const parser = new DOMParser();
                    const xml = parser.parseFromString(xmlText, 'text/xml');
                    const obj = this.ngxXml2jsonService.xmlToJson(xml) as any;

                    // Robustly extract gml:identifier regardless of the feature type key
                    let id: string | undefined;
                    try {
                      const featureMember = obj?.FeatureCollection?.['gml:featureMember'];
                      if (featureMember && typeof featureMember === 'object') {
                        // Get the first key (e.g., "ge:MappedFeature", "other:FeatureType", etc.)
                        const featureTypeKey = Object.keys(featureMember).find(k => k !== '#text' && k !== '@attributes');
                        if (featureTypeKey) {
                          id = featureMember[featureTypeKey]?.['gml:identifier'];
                        }
                      }
                    } catch { id = undefined; }

                    console.log(layer)

                    layersInfo.push({
                      type: 'wms',
                      layerGroup: l.values_?.layerName,
                      layerTitle: layer.get('title'),
                      layerName: layer.get('name'),
                      id,
                      data: obj
                    });
                  })
                  .catch(error => {

                  })
              );
            }
          }

          // WFS Vector Features
          if (source && typeof source.getFeaturesAtCoordinate === 'function') {
            const features = source.getFeaturesAtCoordinate(evt.coordinate);
            if (features && features.length > 0) {
              features.forEach((feature: any) => {
                console.log(layer)
                const properties = feature.getProperties()
                layersInfo.push({
                  id: properties.identifier?._content_,
                  type: 'wfs',
                  layerGroup: properties.layerGroup,
                  layerTitle: properties.layerTitle,
                  layerName: properties.layerName,
                  data: properties
                });
                console.log('WFS Feature:', feature.getProperties());
              });
            }
          }
        }
      });
    });

    // Wait for all WMS fetches to finish
    await Promise.all(fetchPromises);

    // Now you have all info in layersInfo
    if (this.showPopupAt) {
      this.showPopupAt(evt.coordinate as [number, number], layersInfo);
    }
  };

  public increaseZoom() {
    var view = this.map.getView();
    var zoom = view.getZoom()!;
    view.setZoom(zoom + 1);
  }

  public decreaseZoom() {
    var view = this.map.getView();
    var zoom = view.getZoom()!;
    view.setZoom(zoom - 1);
  }

  private positionHistory: { center: [number, number], zoom: number }[] = [];
  private historyIndex: number = -1;



  storeCurrentPosition() {
    const view = this.map.getView();
    const center = view.getCenter() as [number, number];
    const zoom = view.getZoom()!;
    // If not at the end, remove forward history
    if (this.historyIndex < this.positionHistory.length - 1) {
      this.positionHistory = this.positionHistory.slice(0, this.historyIndex + 1);
    }
    this.positionHistory.push({ center, zoom });
    this.historyIndex = this.positionHistory.length - 1;
    console.log('Current position stored:', { center, zoom });


  }
  private storePositionTimeout: any = null;

  debouncedStoreCurrentPosition() {
    if (this.isSwitching) {
      this.isSwitching = false;
      return; // Skip storing position if switching is in progress

    }

    if (this.storePositionTimeout) {
      clearTimeout(this.storePositionTimeout);
    }
    this.storePositionTimeout = setTimeout(() => {
      this.storeCurrentPosition();
      this.storePositionTimeout = null;
    }, 300); // 1 second delay
  }

  isSwitching = false
  goBackPosition() {
    this.isSwitching = true;
    if (this.positionHistory.length === 0 || this.historyIndex <= 0) {
      return;
    }
    if (this.historyIndex > 0) {
      this.historyIndex--;
      const pos = this.positionHistory[this.historyIndex];
      this.setView(pos.center, pos.zoom);
    }
  }

  goForwardPosition() {
    this.isSwitching = true;

    if (this.historyIndex < this.positionHistory.length - 1) {
      this.historyIndex++;
      const pos = this.positionHistory[this.historyIndex];
      this.setView(pos.center, pos.zoom);
    }
  }

  disablePopup() {
    if (this.popupHandler) {
      this.map.un('singleclick', this.popupHandler);
    }
  }

  enablePopup() {
    if (this.popupHandler) {
      this.map.on('singleclick', this.popupHandler);
    }
  }

  activateAreaMeasure() {
    const map = this.map;

    if (!this.measureSource) {
      this.measureSource = new VectorSource();
    }
    if (!this.measureLayer) {
      this.measureLayer = new VectorLayer({
        source: this.measureSource,
      });
      map.addLayer(this.measureLayer);
    }

    let draw: Draw | null = null;
    let measureTooltipElement: HTMLElement | null = null;
    let measureTooltip: Overlay | null = null;

    if ((map as any).areaDrawInteraction) {
      map.removeInteraction((map as any).areaDrawInteraction);
      (map as any).areaDrawInteraction = null;
    }

    function createMeasureTooltip() {
      if (measureTooltipElement) {
        measureTooltipElement.parentNode?.removeChild(measureTooltipElement);
      }
      measureTooltipElement = document.createElement('div');
      measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
      measureTooltip = new Overlay({
        element: measureTooltipElement,
        offset: [0, -15],
        positioning: 'bottom-center'
      });
      map.addOverlay(measureTooltip);
    }

    function formatArea(polygon: any): string {
      const area = polygon.getArea();
      let output;
      if (area > 1000000) {
        output = (Math.round((area / 1000000) * 100) / 100) + ' km²';
      } else {
        output = (Math.round(area * 100) / 100) + ' m²';
      }
      return output;
    }

    function formatLength(line: any): string {
      const length = getLength(line);
      let output;
      if (length > 1000) {
        output = (Math.round((length / 1000) * 100) / 100) + ' km';
      } else {
        output = (Math.round(length * 100) / 100) + ' m';
      }
      return output;
    }

    this.isDrawing = true; // before adding draw interaction
    this.disablePopup();

    // Use persistent measureSource here!
    draw = new Draw({
      source: this.measureSource,
      type: 'Polygon'
    });

    map.addInteraction(draw);
    (map as any).areaDrawInteraction = draw;

    createMeasureTooltip();

    draw.on('drawstart', (evt: any) => {
      console.log(evt)
      const feature = evt.feature;
      const geom = feature.getGeometry();

      geom.on('change', () => {
        const output = formatArea(geom);
        const coordinates = geom.getInteriorPoint().getCoordinates();

        // Clear previous content
        measureTooltipElement!.innerHTML = '';

        // Add measurement text
        const textSpan = document.createElement('span');
        textSpan.textContent = output;
        measureTooltipElement!.appendChild(textSpan);

        // Add remove button
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Usuń pomiar';
        removeBtn.style.marginLeft = '8px';
        removeBtn.onclick = () => {
          if (this.measureSource) {
            this.measureSource.removeFeature(feature);
          }
          if (measureTooltip) {
            this.map.removeOverlay(measureTooltip);
          }
        };
        measureTooltipElement!.appendChild(removeBtn);

        measureTooltip!.setPosition(coordinates);
      });
    });

    draw.on('drawend', () => {
      setTimeout(() => {
        this.map.removeInteraction(draw!);
        if (measureTooltipElement) {
          measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
          measureTooltip!.setOffset([0, -7]);
        }
        measureTooltipElement = null;
        this.isDrawing = false; // <--- allow popup again
        setTimeout(() => this.enablePopup(), 250);
      }, 100);
    });
  }

  private measureLayer: any | null = null;
  private measureSource: VectorSource | null = null;

  activateDistanceMeasure() {
    const map = this.map;

    // Create persistent source/layer if not exists
    if (!this.measureSource) {
      this.measureSource = new VectorSource();
    }
    if (!this.measureLayer) {
      this.measureLayer = new VectorLayer({
        source: this.measureSource,
      });
      map.addLayer(this.measureLayer);
    }

    let draw: Draw | null = null;
    let measureTooltipElement: HTMLElement | null = null;
    let measureTooltip: Overlay | null = null;

    // Remove previous interaction if exists
    if ((map as any).distanceDrawInteraction) {
      map.removeInteraction((map as any).distanceDrawInteraction);
      (map as any).distanceDrawInteraction = null;
    }

    // Create tooltip
    function createMeasureTooltip() {
      if (measureTooltipElement) {
        measureTooltipElement.parentNode?.removeChild(measureTooltipElement);
      }
      measureTooltipElement = document.createElement('div');
      measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
      measureTooltip = new Overlay({
        element: measureTooltipElement,
        offset: [0, -15],
        positioning: 'bottom-center'
      });
      map.addOverlay(measureTooltip);
    }

    // Format length output
    function formatLength(line: any): string {
      const length = getLength(line);
      let output;
      if (length > 1000) {
        output = (Math.round((length / 1000) * 100) / 100) + ' km';
      } else {
        output = (Math.round(length * 100) / 100) + ' m';
      }
      return output;
    }

    this.isDrawing = true; // <--- ADD THIS LINE
    this.disablePopup();

    // Use persistent measureSource here!
    draw = new Draw({
      source: this.measureSource,
      type: 'LineString',
      maxPoints: 2
    });

    map.addInteraction(draw);
    (map as any).distanceDrawInteraction = draw;

    createMeasureTooltip();

    draw.on('drawstart', (evt: any) => {
      const feature = evt.feature;
      const geom = feature.getGeometry();

      geom.on('change', () => {
        const output = formatLength(geom);
        const coordinates = geom.getLastCoordinate();

        // Clear previous content
        measureTooltipElement!.innerHTML = '';

        // Add measurement text
        const textSpan = document.createElement('span');
        textSpan.textContent = output;
        measureTooltipElement!.appendChild(textSpan);

        // Add remove button
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Usuń pomiar';
        removeBtn.style.marginLeft = '8px';
        removeBtn.onclick = () => {
          if (this.measureSource) {
            this.measureSource.removeFeature(feature);
          }
          if (measureTooltip) {
            this.map.removeOverlay(measureTooltip);
          }
        };
        measureTooltipElement!.appendChild(removeBtn);

        measureTooltip!.setPosition(coordinates);
      });
    });

    draw.on('drawend', () => {
      setTimeout(() => {
        this.map.removeInteraction(draw!);
        if (measureTooltipElement) {
          measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
          measureTooltip!.setOffset([0, -7]);
        }
        measureTooltipElement = null;
        this.isDrawing = false; // <--- ADD THIS LINE
        setTimeout(() => this.enablePopup(), 250);
      }, 100);
    });
  }


  setView(center: [number, number], zoom?: number) {
    var currentZoom = this.map.getView().getZoom()
    zoom = zoom === undefined ? currentZoom : zoom
    //var zoom = zoom === undefined ? currentZoom : zoom
    this.map.getView().setZoom(zoom!)
    this.map.getView().setCenter(center);
  }

  updateSize(target = 'map') {
    this.map.setTarget(target);
    this.map.updateSize();
  }

  zoomIn() {
    var view = this.map.getView()
    var zoom = view?.getZoom()!
    view.setZoom(zoom + 1)
  }

  zoomOut() {
    var view = this.map.getView()
    var zoom = view?.getZoom()!
    view.setZoom(zoom - 1)
  }

  refreshMap() {
    setTimeout(() => { this.map.updateSize(); }, 100);
  }

  getCenterOfExtent(Extent: number[]): [number, number] {
    var X = Extent[0] + (Extent[2] - Extent[0]) / 2;
    var Y = Extent[1] + (Extent[3] - Extent[1]) / 2;
    return [X - 35, Y];
  }

  getFeature(geometry: any) {
    var geoJsonObject = new GeoJSON();
    var feature = geoJsonObject.readFeature(geometry);

    return feature
  }

  private isDrawing = false;
}


