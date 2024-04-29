import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveRequestEditorComponent } from './leave-request-editor.component';

describe('LeaveRequestEditorComponent', () => {
  let component: LeaveRequestEditorComponent;
  let fixture: ComponentFixture<LeaveRequestEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeaveRequestEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveRequestEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
