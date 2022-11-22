import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SliderBottomContentComponent } from './slider-bottom-content.component';

describe('SliderBottomContentComponent', () => {
  let component: SliderBottomContentComponent;
  let fixture: ComponentFixture<SliderBottomContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SliderBottomContentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SliderBottomContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
