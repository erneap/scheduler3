import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteScheduleCoverageDaysComponent } from './site-schedule-coverage-days.component';

describe('SiteScheduleCoverageDaysComponent', () => {
  let component: SiteScheduleCoverageDaysComponent;
  let fixture: ComponentFixture<SiteScheduleCoverageDaysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteScheduleCoverageDaysComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteScheduleCoverageDaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
