import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportScheduleComponent } from './report-schedule.component';

describe('ReportScheduleComponent', () => {
  let component: ReportScheduleComponent;
  let fixture: ComponentFixture<ReportScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportScheduleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
