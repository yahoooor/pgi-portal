import Map from 'ol/Map';
import View from 'ol/View';
import { Injectable } from '@angular/core';
import { register } from 'ol/proj/proj4';
import Projection from 'ol/proj/Projection';
import proj4, { Proj } from 'proj4'
import GeoJSON from 'ol/format/GeoJSON';

import { MapBrowserEvent } from 'ol';

import { Subject } from 'rxjs';
import { BaseLayers } from '../consts/layers';
import { addCoordinateTransforms, addEquivalentProjections } from 'ol/proj';





@Injectable({
  providedIn: 'root'
})
export class MapService {

  map!: Map;

  constructor() {
    this.setUpMap()
  }

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
        //projection: myProjection,
        //projection: 'EPSG:3857',
        //center: [361000.1344, 363000.9189],

        center: [2100000, 6700000],
        zoom: 6 //6.2,
      }),
      controls: [],
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
}


