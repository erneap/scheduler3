import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEmployeesLeaveApprovalComponent } from './site-employees-leave-approval.component';

describe('SiteEmployeesLeaveApprovalComponent', () => {
  let component: SiteEmployeesLeaveApprovalComponent;
  let fixture: ComponentFixture<SiteEmployeesLeaveApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteEmployeesLeaveApprovalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEmployeesLeaveApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
