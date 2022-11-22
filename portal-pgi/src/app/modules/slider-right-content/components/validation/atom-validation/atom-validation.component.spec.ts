import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtomValidationComponent } from './atom-validation.component';

describe('AtomValidationComponent', () => {
  let component: AtomValidationComponent;
  let fixture: ComponentFixture<AtomValidationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AtomValidationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AtomValidationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
