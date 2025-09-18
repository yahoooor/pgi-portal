import { Component, Input, OnInit } from '@angular/core';
import { HttpService } from 'src/app/services/http.service';






@Component({
  selector: 'app-new-layer',
  templateUrl: './new-layer.component.html',
  styleUrls: ['./new-layer.component.scss']
})
export class NewLayerComponent implements OnInit {
  @Input() isAtom = false;
  @Input() url: string | null = null

  hidden = true
  activeIndex: number = 0

  constructor(private http: HttpService,) {

  }

  ngOnInit(): void {
    if (this.url) {
      if (this.url.includes("wfs")) {
        this.activeIndex = 1
      }
    }
  }
}
