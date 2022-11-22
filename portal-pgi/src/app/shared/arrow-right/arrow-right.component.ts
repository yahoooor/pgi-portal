import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-arrow-right',
  templateUrl: './arrow-right.component.html',
  styleUrls: ['./arrow-right.component.scss']
})
export class ArrowRightComponent implements OnInit {
  @Input('isArrowOpen')
  isArrowOpen: boolean = true;
  
  constructor() { }

  ngOnInit(): void {
  }

}
