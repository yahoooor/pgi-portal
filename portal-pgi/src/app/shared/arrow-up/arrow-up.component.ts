import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-arrow-up',
  templateUrl: './arrow-up.component.html',
  styleUrls: ['./arrow-up.component.scss']
})
export class ArrowUpComponent implements OnInit {
  @Input('isArrowOpen')
  isArrowOpen: boolean = true;

  constructor() { }

  ngOnInit(): void {
  }


}
