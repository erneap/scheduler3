import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteScheduleMonthOfficeComponent } from './site-schedule-month-office.component';

describe('SiteScheduleMonthOfficeComponent', () => {
  let component: SiteScheduleMonthOfficeComponent;
  let fixture: ComponentFixture<SiteScheduleMonthOfficeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteScheduleMonthOfficeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteScheduleMonthOfficeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
