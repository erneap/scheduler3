import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEmployeeLeaveBalanceComponent } from './site-employee-leave-balance.component';

describe('SiteEmployeeLeaveBalanceComponent', () => {
  let component: SiteEmployeeLeaveBalanceComponent;
  let fixture: ComponentFixture<SiteEmployeeLeaveBalanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteEmployeeLeaveBalanceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEmployeeLeaveBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
