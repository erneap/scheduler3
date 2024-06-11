import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeLeaveRequestEditorUnapproveComponent } from './employee-leave-request-editor-unapprove.component';

describe('EmployeeLeaveRequestEditorUnapproveComponent', () => {
  let component: EmployeeLeaveRequestEditorUnapproveComponent;
  let fixture: ComponentFixture<EmployeeLeaveRequestEditorUnapproveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeLeaveRequestEditorUnapproveComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeLeaveRequestEditorUnapproveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
