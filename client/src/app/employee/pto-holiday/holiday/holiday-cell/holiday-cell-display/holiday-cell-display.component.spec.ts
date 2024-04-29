import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HolidayCellDisplayComponent } from './holiday-cell-display.component';

describe('HolidayCellDisplayComponent', () => {
  let component: HolidayCellDisplayComponent;
  let fixture: ComponentFixture<HolidayCellDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HolidayCellDisplayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HolidayCellDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
