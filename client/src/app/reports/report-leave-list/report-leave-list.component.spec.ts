import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportLeaveListComponent } from './report-leave-list.component';

describe('ReportLeaveListComponent', () => {
  let component: ReportLeaveListComponent;
  let fixture: ComponentFixture<ReportLeaveListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportLeaveListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportLeaveListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
