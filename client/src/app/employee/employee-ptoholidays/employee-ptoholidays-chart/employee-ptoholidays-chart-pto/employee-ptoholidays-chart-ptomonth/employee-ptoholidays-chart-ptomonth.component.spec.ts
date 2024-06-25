import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeePTOHolidaysChartPTOMonthComponent } from './employee-ptoholidays-chart-ptomonth.component';

describe('EmployeePTOHolidaysChartPTOMonthComponent', () => {
  let component: EmployeePTOHolidaysChartPTOMonthComponent;
  let fixture: ComponentFixture<EmployeePTOHolidaysChartPTOMonthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeePTOHolidaysChartPTOMonthComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeePTOHolidaysChartPTOMonthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
