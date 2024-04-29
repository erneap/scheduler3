import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEmployeeLeaveRequestsComponent } from './site-employee-leave-requests.component';

describe('SiteEmployeeLeaveRequestsComponent', () => {
  let component: SiteEmployeeLeaveRequestsComponent;
  let fixture: ComponentFixture<SiteEmployeeLeaveRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteEmployeeLeaveRequestsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEmployeeLeaveRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
