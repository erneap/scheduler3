import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PtoHolidayChartComponent } from './pto-holiday-chart.component';

describe('PtoHolidayChartComponent', () => {
  let component: PtoHolidayChartComponent;
  let fixture: ComponentFixture<PtoHolidayChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PtoHolidayChartComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PtoHolidayChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
