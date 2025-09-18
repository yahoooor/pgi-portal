import { AfterViewInit, Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import Overlay from 'ol/Overlay';
import { HttpService } from 'src/app/services/http.service';
import { MapService } from 'src/app/services/map.service';
import { MapPopupComponent } from './map-popup/map-popup.component';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit {
  @ViewChild('popupHost', { read: ViewContainerRef }) popupHost!: ViewContainerRef;

  popupVisible = false;
  popupLayersInfo: any[] = [];
  popupCoordinates: [number, number] | null = null;
  private popupOverlay!: Overlay;

  constructor(private mapService: MapService,
    private http: HttpService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.mapService.updateSize()

      // Create popup overlay
      this.popupOverlay = new Overlay({
        element: document.getElementById('map-popup')!,
        positioning: 'bottom-center',
        stopEvent: true,
        offset: [0, -20]
      });
      this.mapService.map.addOverlay(this.popupOverlay);

      // Listen for popup requests from the service
      this.mapService.showPopupAt = (coordinate: [number, number], layersInfo: any[]) => {
        this.showPopup(coordinate, layersInfo);
      };
      this.mapService.hidePopup = () => {
        this.hidePopup();
      };


    }, 250);

  }

  showPopup(coordinate: [number, number], layersInfo: any[]) {
    this.popupLayersInfo = layersInfo;
    this.popupCoordinates = coordinate;
    this.popupVisible = true;
    this.popupOverlay.setPosition(coordinate);
  }

  hidePopup() {
    this.popupVisible = false;
    this.popupOverlay.setPosition(undefined);
  }



}
