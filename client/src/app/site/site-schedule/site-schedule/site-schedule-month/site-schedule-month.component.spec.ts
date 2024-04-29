import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteScheduleMonthComponent } from './site-schedule-month.component';

describe('SiteScheduleMonthComponent', () => {
  let component: SiteScheduleMonthComponent;
  let fixture: ComponentFixture<SiteScheduleMonthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteScheduleMonthComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteScheduleMonthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
