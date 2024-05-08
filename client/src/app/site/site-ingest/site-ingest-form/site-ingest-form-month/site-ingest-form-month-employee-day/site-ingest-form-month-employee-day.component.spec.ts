import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteIngestFormMonthEmployeeDayComponent } from './site-ingest-form-month-employee-day.component';

describe('SiteIngestFormMonthEmployeeDayComponent', () => {
  let component: SiteIngestFormMonthEmployeeDayComponent;
  let fixture: ComponentFixture<SiteIngestFormMonthEmployeeDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteIngestFormMonthEmployeeDayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteIngestFormMonthEmployeeDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
