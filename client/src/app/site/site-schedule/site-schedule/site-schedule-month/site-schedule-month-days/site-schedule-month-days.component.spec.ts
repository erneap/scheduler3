import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteScheduleMonthDaysComponent } from './site-schedule-month-days.component';

describe('SiteScheduleMonthDaysComponent', () => {
  let component: SiteScheduleMonthDaysComponent;
  let fixture: ComponentFixture<SiteScheduleMonthDaysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteScheduleMonthDaysComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteScheduleMonthDaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
