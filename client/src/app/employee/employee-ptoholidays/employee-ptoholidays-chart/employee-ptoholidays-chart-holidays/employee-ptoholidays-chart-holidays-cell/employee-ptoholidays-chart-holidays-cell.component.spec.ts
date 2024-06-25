import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeePTOHolidaysChartHolidaysCellComponent } from './employee-ptoholidays-chart-holidays-cell.component';

describe('EmployeePTOHolidaysChartHolidaysCellComponent', () => {
  let component: EmployeePTOHolidaysChartHolidaysCellComponent;
  let fixture: ComponentFixture<EmployeePTOHolidaysChartHolidaysCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeePTOHolidaysChartHolidaysCellComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeePTOHolidaysChartHolidaysCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
