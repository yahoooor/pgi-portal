import { Component, ChangeDetectorRef, Input, OnInit, OnChanges } from '@angular/core';
import { MapService } from 'src/app/services/map.service';

@Component({
  selector: 'app-map-popup',
  templateUrl: './map-popup.component.html',
  styleUrls: ['./map-popup.component.scss']
})
export class MapPopupComponent implements OnChanges {
  @Input() layersInfo: any[] = [];
  @Input() visible: boolean = false;
  @Input() coordinates: [number, number] | null = null;

  constructor(private mapService: MapService, public changeDetectorRef: ChangeDetectorRef) {}  

  ngOnChanges(simpleChanges: any) {
    console.log(simpleChanges)
  }

  close(evt: MouseEvent) {
    evt.stopPropagation();
    evt.preventDefault();
    if (this.mapService.hidePopup) {
      this.mapService.hidePopup();
    }
    this.visible = false;
  }
}


