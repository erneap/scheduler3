import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEmployeeLeaveBalanceDialogComponent } from './site-employee-leave-balance-dialog.component';

describe('SiteEmployeeLeaveBalanceDialogComponent', () => {
  let component: SiteEmployeeLeaveBalanceDialogComponent;
  let fixture: ComponentFixture<SiteEmployeeLeaveBalanceDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteEmployeeLeaveBalanceDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEmployeeLeaveBalanceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
