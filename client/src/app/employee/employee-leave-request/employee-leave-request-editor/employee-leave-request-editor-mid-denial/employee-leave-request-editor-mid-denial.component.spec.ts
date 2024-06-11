import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeLeaveRequestEditorMidDenialComponent } from './employee-leave-request-editor-mid-denial.component';

describe('EmployeeLeaveRequestEditorMidDenialComponent', () => {
  let component: EmployeeLeaveRequestEditorMidDenialComponent;
  let fixture: ComponentFixture<EmployeeLeaveRequestEditorMidDenialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeLeaveRequestEditorMidDenialComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeLeaveRequestEditorMidDenialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
