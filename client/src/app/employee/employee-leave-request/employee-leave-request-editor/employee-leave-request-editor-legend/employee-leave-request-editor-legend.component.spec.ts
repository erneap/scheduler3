import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeLeaveRequestEditorLegendComponent } from './employee-leave-request-editor-legend.component';

describe('EmployeeLeaveRequestEditorLegendComponent', () => {
  let component: EmployeeLeaveRequestEditorLegendComponent;
  let fixture: ComponentFixture<EmployeeLeaveRequestEditorLegendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeLeaveRequestEditorLegendComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeLeaveRequestEditorLegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
