import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteScheduleCoverageDayComponent } from './site-schedule-coverage-day.component';

describe('SiteScheduleCoverageDayComponent', () => {
  let component: SiteScheduleCoverageDayComponent;
  let fixture: ComponentFixture<SiteScheduleCoverageDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteScheduleCoverageDayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteScheduleCoverageDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
