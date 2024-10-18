import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEmployeesVariationCalendarComponent } from './site-employees-variation-calendar.component';

describe('SiteEmployeesVariationCalendarComponent', () => {
  let component: SiteEmployeesVariationCalendarComponent;
  let fixture: ComponentFixture<SiteEmployeesVariationCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SiteEmployeesVariationCalendarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEmployeesVariationCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
