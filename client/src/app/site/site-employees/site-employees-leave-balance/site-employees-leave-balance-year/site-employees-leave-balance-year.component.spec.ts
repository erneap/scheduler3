import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEmployeesLeaveBalanceYearComponent } from './site-employees-leave-balance-year.component';

describe('SiteEmployeesLeaveBalanceYearComponent', () => {
  let component: SiteEmployeesLeaveBalanceYearComponent;
  let fixture: ComponentFixture<SiteEmployeesLeaveBalanceYearComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteEmployeesLeaveBalanceYearComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEmployeesLeaveBalanceYearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
