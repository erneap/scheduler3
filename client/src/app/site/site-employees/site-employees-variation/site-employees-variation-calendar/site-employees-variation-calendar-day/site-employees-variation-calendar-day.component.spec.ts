import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEmployeesVariationCalendarDayComponent } from './site-employees-variation-calendar-day.component';

describe('SiteEmployeesVariationCalendarDayComponent', () => {
  let component: SiteEmployeesVariationCalendarDayComponent;
  let fixture: ComponentFixture<SiteEmployeesVariationCalendarDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SiteEmployeesVariationCalendarDayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEmployeesVariationCalendarDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
