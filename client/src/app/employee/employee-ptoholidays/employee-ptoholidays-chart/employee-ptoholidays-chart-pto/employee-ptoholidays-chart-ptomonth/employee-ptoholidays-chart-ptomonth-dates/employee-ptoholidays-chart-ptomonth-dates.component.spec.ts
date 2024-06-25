import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeePTOHolidaysChartPTOMonthDatesComponent } from './employee-ptoholidays-chart-ptomonth-dates.component';

describe('EmployeePTOHolidaysChartPTOMonthDatesComponent', () => {
  let component: EmployeePTOHolidaysChartPTOMonthDatesComponent;
  let fixture: ComponentFixture<EmployeePTOHolidaysChartPTOMonthDatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeePTOHolidaysChartPTOMonthDatesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeePTOHolidaysChartPTOMonthDatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
