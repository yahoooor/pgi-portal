import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewLayerComponent } from './new-layer.component';

describe('NewLayerComponent', () => {
  let component: NewLayerComponent;
  let fixture: ComponentFixture<NewLayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewLayerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewLayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
