import { identifierModuleUrl } from '@angular/compiler';
import { Component, OnInit, setTestabilityGetter } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { HttpService } from 'src/app/services/http.service';
import { MapService } from 'src/app/services/map.service';

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
import LayerGroup from 'ol/layer/Group';
import Layer from 'ol/layer/Layer';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';

import { LayerLegend, WmsLayersLegend, LayerGroupLegend, WmsLayers, WmsChildLayers } from 'src/app/consts/layers';

interface AtomEntry {
  category: string,
  title: string,
  id: string,
  isSelected: boolean,
  url?: string,
  isLoading: boolean,
  contentSize: any,
  type: string,
  disabled: boolean,
  sizeLoading: boolean
}

@Component({
  selector: 'app-atom',
  templateUrl: './atom.component.html',
  styleUrls: ['./atom.component.scss']
})
export class AtomComponent implements OnInit {

  searchingAtom = false;
  urlAtom = "";

  atomGroupTitle = ""
  atomEntries: AtomEntry[] = []
  atomLinks: string[] = []
  linksArrSize = 0;

  invertedCoordinates = false;

  atomLinks$ = new Subject<number>();
  urlAtomChanged: Subject<string> = new Subject<string>();

  constructor(private http: HttpService,
    private toastService: ToastService,
    private ngxXml2jsonService: NgxXml2jsonService,
    private mapService: MapService) {
    this.urlAtomChanged.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.parseAtom(this.urlAtom)
    })
  }

  ngOnInit(): void {

    this.atomLinks$.subscribe(
      linkCount => {
        console.log(linkCount)
        console.log(this.linksArrSize)
        if (linkCount == this.linksArrSize) {
          setTimeout(() => {
            this.atomEntries.forEach((element: AtomEntry) => {
              console.log("GET SIZE: ", element)

              this.http.getSize(element.url).subscribe(
                data => {
                  let contentSize = data.headers.get('content-length')
                  element.contentSize = Number(contentSize)
                  element.sizeLoading = false

                  if (element.type == "application/gml+xml" &&
                    element.contentSize <= 5000000 &&
                    element.category == "EPSG:4326") {

                    element.disabled = false
                  }
                },
                error => {
                  element.sizeLoading = false
                }
              )
              /*
              this.http.getFileSize(element.url).then(
                contentSize => {
                  element.contentSize = Number(contentSize)
                  element.sizeLoading = false
                }
              ).catch(erorr => {
                this.searchingAtom = false
              })

              if (element.type == "application/gml+xml" &&
                element.contentSize <= 5000000 &&
                element.category == "EPSG:4326") {

                element.disabled = false
              } */
            });

          }, 300);

        }
      }
    )
  }


  atomInputChange() {
    this.urlAtomChanged.next(this.urlAtom)
  }

  parseAtom(url: string) {

    if (url == '' || url == " ") {
      return
    }

    this.resetSearching()
    this.searchingAtom = true

    //let atomLinks: string[] = []

    url = this.http.corsUrl + url

    this.http.getCapabilities(url).subscribe(
      async (dataXML: any) => {
        const parser = new DOMParser();
        const xml = parser.parseFromString(dataXML, 'text/xml');
        const obj = this.ngxXml2jsonService.xmlToJson(xml) as any;
        console.log(obj)

        console.log(findAllByKey(obj, "entry"))

        // set title 
        let feed = findAllByKey(obj, "feed")[0] as any || {}
        this.atomGroupTitle = feed.title || ""

        // set entries
        let entries = findAllByKey(obj, "entry") as any
        for (let entry of entries) {


          this.atomLinks.push(...findAllByKey(entry, "href"))

        }
        this.linksArrSize = entries.length

        this.getAtomLinks(this.atomLinks)


        // check all links in atom XML



      },
      error => {
        this.searchingAtom = false
      }
    )
  }

  getAtomLinks(atomLinks: any) {
    let linkCounter = 0

    for (let link of atomLinks) {
      this.http.getCapabilities(this.http.corsUrl + link).subscribe(
        dataXML => {

          const parser = new DOMParser();
          const xml = parser.parseFromString(dataXML, 'text/xml');
          const obj = this.ngxXml2jsonService.xmlToJson(xml) as any;
          let entries = findAllByKey(obj, "entry") as any

          for (let entry of entries) {
            this.searchingAtom = true

            let tempAtomEntry: AtomEntry = {
              isSelected: false,
              title: findAllByKey(entry, "title")[0],
              category: findAllByKey(entry, "label")[0],
              url: findAllByKey(entry, "href")[0],
              id: entry.id,
              isLoading: false,
              contentSize: 0,
              type: findAllByKey(entry, "type")[0],
              disabled: true,
              sizeLoading: true
            }
            /*await this.http.getFileSize(tempAtomEntry.url).then(
              
              contentSize => tempAtomEntry.contentSize = Number(contentSize)
            ).catch( erorr => {
              this.searchingAtom = false
            })

            if (tempAtomEntry.type == "application/gml+xml" &&
              tempAtomEntry.contentSize <= 5000000 &&
              tempAtomEntry.category == "EPSG:4326") {

              tempAtomEntry.disabled = false
            }*/

            this.atomEntries.push(tempAtomEntry)
            this.searchingAtom = false
            console.log(tempAtomEntry)

            linkCounter++
            this.atomLinks$.next(linkCounter)
          }

          this.searchingAtom = false
        }
      )
    }
  }

  downloadAtom(evt: any, atomEntry: AtomEntry) {
    console.log(atomEntry)

    atomEntry.isLoading = true

    let downloadName = atomEntry.title + `(${atomEntry.category})`
    let downloadExtension = ""

    this.http.downloadFile(atomEntry.url!).subscribe(
      (data: any) => {
        console.log(data)

        //let blob = new Blob([data], { type: atomEntry.type });
        var downloadURL = window.URL.createObjectURL(data);
        var link = document.createElement('a');
        link.href = downloadURL;

        switch (atomEntry.type) {

          case "application/x-shapefile":
            downloadExtension = ".zip"
            break;

          case "application/gml+xml":
            downloadExtension = ".gml"
            break;

          default:
            break;
        }
        link.download = downloadName + downloadExtension
        link.click();

        atomEntry.isLoading = false;
      },
      error => {
        atomEntry.isLoading = false;
      }
    )
  }

  resetSearching() {
    this.atomEntries = [];
    this.atomLinks = [];
    this.atomGroupTitle = "";
    this.linksArrSize = 0;
  }

  cancelSearching() {
    this.resetSearching()
    this.urlAtom = ""
    this.atomInputChange()
  }

  onLayerCheckboxChange(evt: any, layer: any) {

  }

  addLayer(layer: AtomEntry) {
    if (layer.disabled) { return }

    console.log(layer)

    let index = 0
    let childLayers: LayerLegend[] = []
    let childMapLayers: Layer[] = []

    // iterate over selected layers

    let color = `rgba(${[1, 2, 3].map(x => Math.random() * 256 | 0)}, 1.0)`
    // layer to legend
    let childLayer: LayerLegend = {
      name: layer.title,
      checked: true,
      expanded: false,
      parentIndex: WmsLayersLegend.length,
      index: index++,
      color: color

      //legendUrl: layer.Style[0].LegendURL[0].OnlineResource
    }
    childLayers.push(childLayer)

    // layer to map 
    /*let outputFormat = this.getOutputFormat()
    let srsName = this.getSrsName()
    let version = this.getVersion() */

    let url = this.http.corsUrl + layer.url!

    let that = this
    var vectorSource = new Vector({
      format: new GML32({
        srsName: "EPSG:4326",
        curve: true
      }),
      loader: function (extent: any, resolution, projection, success: any, failure: any) {

        that.http.getCapabilities(url).subscribe(
          (dataXML: any) => {
            var features = vectorSource.getFormat()?.readFeatures(dataXML, {
              featureProjection: 'EPSG:3857',
              dataProjection: that.invertedCoordinates ? "inverted_EPSG:4326" : "EPSG:4326",
            }) as Feature<Geometry>[];

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
    let WFSLayer = new VectorLayer(
      {
        source: vectorSource,
        style: new Style({
          fill: undefined,
          stroke: new Stroke({
            color: color,
            width: 3
          }),
        })
      });


    childMapLayers.push(WFSLayer)



    // adding new layers a a group to legend
    let newLayerGroup: LayerGroupLegend = {
      name: this.atomGroupTitle ? this.atomGroupTitle : "ATOM",
      checked: true,
      expanded: false,
      childLayers: childLayers,
      index: WmsLayers.length
    }

    let layerExists = this.checkLayerExists(newLayerGroup)

    if (layerExists) {
      this.toastService.showMessageInfo("Wybrana warstwa już istnieje")
    } else {
      WmsLayersLegend.push(newLayerGroup)
      WmsChildLayers.push(childMapLayers)

      // adding new layers as a group to map
      let wmsLayerGroup = new LayerGroup({
        layers: WmsChildLayers[WmsLayers.length]
      })
      wmsLayerGroup.setProperties({
        name: this.atomGroupTitle ? this.atomGroupTitle : "ATOM",
      })

      WmsLayers.push(wmsLayerGroup)
      this.mapService.map.addLayer(wmsLayerGroup)

      this.toastService.showMessageSuccess("Dodano warstwę")
    }

    // return all layers
    this.mapService.map.getLayers().forEach(layer => {
      console.log(layer)
    })

  }

  checkLayerExists(newLayer: LayerGroupLegend) {
    let layerExits = false;

    WmsLayersLegend.forEach(layerGroup => {
      if (layerGroup.name === newLayer.name) {

        layerGroup.childLayers.forEach(childLayers => {
          if (childLayers.name === layerGroup.childLayers[0].name) {
            layerExits = true
          }
        });
      }
    });

    return layerExits

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

