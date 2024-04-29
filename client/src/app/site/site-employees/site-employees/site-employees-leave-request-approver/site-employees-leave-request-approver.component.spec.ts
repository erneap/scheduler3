import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEmployeesLeaveRequestApproverComponent } from './site-employees-leave-request-approver.component';

describe('SiteEmployeesLeaveRequestApproverComponent', () => {
  let component: SiteEmployeesLeaveRequestApproverComponent;
  let fixture: ComponentFixture<SiteEmployeesLeaveRequestApproverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteEmployeesLeaveRequestApproverComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEmployeesLeaveRequestApproverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
