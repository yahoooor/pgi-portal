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
import Stroke from 'ol/style/Stroke';
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





@Component({
  selector: 'app-new-layer',
  templateUrl: './new-layer.component.html',
  styleUrls: ['./new-layer.component.scss']
})
export class NewLayerComponent implements OnInit {

  hidden = true

  constructor(private http: HttpService,) {

  }

  ngOnInit(): void {
    
  }
}
