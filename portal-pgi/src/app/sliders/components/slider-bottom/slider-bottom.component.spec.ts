import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SliderBottomComponent } from './slider-bottom.component';

describe('SliderBottomComponent', () => {
  let component: SliderBottomComponent;
  let fixture: ComponentFixture<SliderBottomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SliderBottomComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SliderBottomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
