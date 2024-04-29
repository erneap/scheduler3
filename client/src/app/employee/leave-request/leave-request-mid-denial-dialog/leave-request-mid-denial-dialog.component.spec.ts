import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveRequestMidDenialDialogComponent } from './leave-request-mid-denial-dialog.component';

describe('LeaveRequestMidDenialDialogComponent', () => {
  let component: LeaveRequestMidDenialDialogComponent;
  let fixture: ComponentFixture<LeaveRequestMidDenialDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeaveRequestMidDenialDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveRequestMidDenialDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
