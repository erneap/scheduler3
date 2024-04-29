import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteLeaveRequestDialogComponent } from './delete-leave-request-dialog.component';

describe('DeleteLeaveRequestDialogComponent', () => {
  let component: DeleteLeaveRequestDialogComponent;
  let fixture: ComponentFixture<DeleteLeaveRequestDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteLeaveRequestDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteLeaveRequestDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
