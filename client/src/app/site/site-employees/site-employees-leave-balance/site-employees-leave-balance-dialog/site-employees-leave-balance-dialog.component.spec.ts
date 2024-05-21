import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEmployeesLeaveBalanceDialogComponent } from './site-employees-leave-balance-dialog.component';

describe('SiteEmployeesLeaveBalanceDialogComponent', () => {
  let component: SiteEmployeesLeaveBalanceDialogComponent;
  let fixture: ComponentFixture<SiteEmployeesLeaveBalanceDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteEmployeesLeaveBalanceDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEmployeesLeaveBalanceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
