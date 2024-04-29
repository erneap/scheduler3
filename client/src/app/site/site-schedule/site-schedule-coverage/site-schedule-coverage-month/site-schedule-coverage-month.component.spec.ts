import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteScheduleCoverageMonthComponent } from './site-schedule-coverage-month.component';

describe('SiteScheduleCoverageMonthComponent', () => {
  let component: SiteScheduleCoverageMonthComponent;
  let fixture: ComponentFixture<SiteScheduleCoverageMonthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteScheduleCoverageMonthComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteScheduleCoverageMonthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
