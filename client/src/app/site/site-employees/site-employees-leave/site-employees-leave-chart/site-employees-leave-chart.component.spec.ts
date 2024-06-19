import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEmployeesLeaveChartComponent } from './site-employees-leave-chart.component';

describe('SiteEmployeesLeaveChartComponent', () => {
  let component: SiteEmployeesLeaveChartComponent;
  let fixture: ComponentFixture<SiteEmployeesLeaveChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SiteEmployeesLeaveChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEmployeesLeaveChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
