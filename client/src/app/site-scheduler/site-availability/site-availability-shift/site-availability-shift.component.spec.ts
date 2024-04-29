import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteAvailabilityShiftComponent } from './site-availability-shift.component';

describe('SiteAvailabilityShiftComponent', () => {
  let component: SiteAvailabilityShiftComponent;
  let fixture: ComponentFixture<SiteAvailabilityShiftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteAvailabilityShiftComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteAvailabilityShiftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
