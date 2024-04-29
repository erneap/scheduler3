import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteAvailabilityComponent } from './site-availability.component';

describe('SiteAvailabilityComponent', () => {
  let component: SiteAvailabilityComponent;
  let fixture: ComponentFixture<SiteAvailabilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteAvailabilityComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteAvailabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
