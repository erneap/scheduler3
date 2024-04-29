import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEmployeeLeaveRequestApproverComponent } from './site-employee-leave-request-approver.component';

describe('SiteEmployeeLeaveRequestApproverComponent', () => {
  let component: SiteEmployeeLeaveRequestApproverComponent;
  let fixture: ComponentFixture<SiteEmployeeLeaveRequestApproverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteEmployeeLeaveRequestApproverComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEmployeeLeaveRequestApproverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
