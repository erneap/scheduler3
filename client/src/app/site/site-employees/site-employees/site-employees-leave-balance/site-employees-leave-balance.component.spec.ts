import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEmployeesLeaveBalanceComponent } from './site-employees-leave-balance.component';

describe('SiteEmployeesLeaveBalanceComponent', () => {
  let component: SiteEmployeesLeaveBalanceComponent;
  let fixture: ComponentFixture<SiteEmployeesLeaveBalanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteEmployeesLeaveBalanceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEmployeesLeaveBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
