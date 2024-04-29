import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteAvailabilityMonthComponent } from './site-availability-month.component';

describe('SiteAvailabilityMonthComponent', () => {
  let component: SiteAvailabilityMonthComponent;
  let fixture: ComponentFixture<SiteAvailabilityMonthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteAvailabilityMonthComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteAvailabilityMonthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
