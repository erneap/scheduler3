import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeePTOHolidaysChartHolidaysCellDisplayComponent } from './employee-ptoholidays-chart-holidays-cell-display.component';

describe('EmployeePTOHolidaysChartHolidaysCellDisplayComponent', () => {
  let component: EmployeePTOHolidaysChartHolidaysCellDisplayComponent;
  let fixture: ComponentFixture<EmployeePTOHolidaysChartHolidaysCellDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeePTOHolidaysChartHolidaysCellDisplayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeePTOHolidaysChartHolidaysCellDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
