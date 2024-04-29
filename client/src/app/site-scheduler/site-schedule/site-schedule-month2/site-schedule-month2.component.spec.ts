import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteScheduleMonth2Component } from './site-schedule-month2.component';

describe('SiteScheduleMonth2Component', () => {
  let component: SiteScheduleMonth2Component;
  let fixture: ComponentFixture<SiteScheduleMonth2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteScheduleMonth2Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteScheduleMonth2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
