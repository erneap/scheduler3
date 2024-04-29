import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteAvailabilityDayComponent } from './site-availability-day.component';

describe('SiteAvailabilityDayComponent', () => {
  let component: SiteAvailabilityDayComponent;
  let fixture: ComponentFixture<SiteAvailabilityDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteAvailabilityDayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteAvailabilityDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
