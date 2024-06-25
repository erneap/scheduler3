import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeePTOHolidaysChartPTOComponent } from './employee-ptoholidays-chart-pto.component';

describe('EmployeePTOHolidaysChartPTOComponent', () => {
  let component: EmployeePTOHolidaysChartPTOComponent;
  let fixture: ComponentFixture<EmployeePTOHolidaysChartPTOComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeePTOHolidaysChartPTOComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeePTOHolidaysChartPTOComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
