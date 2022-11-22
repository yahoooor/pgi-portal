import { AfterViewInit, Component, OnInit } from '@angular/core';
import { tap, repeatWhen, takeWhile, delay, take, map } from 'rxjs/operators';
import { HttpService } from 'src/app/services/http.service';
import { MapService } from 'src/app/services/map.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit {

  constructor(private mapService: MapService,
    private http: HttpService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.mapService.updateSize()


      
    }, 250);

  }



}
