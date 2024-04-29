import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveUnapproveDialogComponent } from './leave-unapprove-dialog.component';

describe('LeaveUnapproveDialogComponent', () => {
  let component: LeaveUnapproveDialogComponent;
  let fixture: ComponentFixture<LeaveUnapproveDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeaveUnapproveDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveUnapproveDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
