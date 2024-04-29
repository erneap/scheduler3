import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteScheduleMonthDayComponent } from './site-schedule-month-day.component';

describe('SiteScheduleMonthDayComponent', () => {
  let component: SiteScheduleMonthDayComponent;
  let fixture: ComponentFixture<SiteScheduleMonthDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteScheduleMonthDayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteScheduleMonthDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
