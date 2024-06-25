import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeePTOHolidaysChartHolidaysComponent } from './employee-ptoholidays-chart-holidays.component';

describe('EmployeePTOHolidaysChartHolidaysComponent', () => {
  let component: EmployeePTOHolidaysChartHolidaysComponent;
  let fixture: ComponentFixture<EmployeePTOHolidaysChartHolidaysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeePTOHolidaysChartHolidaysComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeePTOHolidaysChartHolidaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
