import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HolidayCellComponent } from './holiday-cell.component';

describe('HolidayCellComponent', () => {
  let component: HolidayCellComponent;
  let fixture: ComponentFixture<HolidayCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HolidayCellComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HolidayCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
