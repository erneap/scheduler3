import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEmployeesLeaveChartRowComponent } from './site-employees-leave-chart-row.component';

describe('SiteEmployeesLeaveChartRowComponent', () => {
  let component: SiteEmployeesLeaveChartRowComponent;
  let fixture: ComponentFixture<SiteEmployeesLeaveChartRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SiteEmployeesLeaveChartRowComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEmployeesLeaveChartRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
