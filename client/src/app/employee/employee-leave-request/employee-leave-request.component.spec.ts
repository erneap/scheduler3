import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeLeaveRequestComponent } from './employee-leave-request.component';

describe('EmployeeLeaveRequestComponent', () => {
  let component: EmployeeLeaveRequestComponent;
  let fixture: ComponentFixture<EmployeeLeaveRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeLeaveRequestComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeLeaveRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
