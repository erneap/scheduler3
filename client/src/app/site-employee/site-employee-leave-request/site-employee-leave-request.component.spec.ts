import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEmployeeLeaveRequestComponent } from './site-employee-leave-request.component';

describe('SiteEmployeeLeaveRequestComponent', () => {
  let component: SiteEmployeeLeaveRequestComponent;
  let fixture: ComponentFixture<SiteEmployeeLeaveRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteEmployeeLeaveRequestComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEmployeeLeaveRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
