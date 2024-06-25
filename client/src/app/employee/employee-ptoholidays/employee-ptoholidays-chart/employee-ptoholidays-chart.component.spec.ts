import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeePTOHolidaysChartComponent } from './employee-ptoholidays-chart.component';

describe('EmployeePTOHolidaysChartComponent', () => {
  let component: EmployeePTOHolidaysChartComponent;
  let fixture: ComponentFixture<EmployeePTOHolidaysChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeePTOHolidaysChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeePTOHolidaysChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
