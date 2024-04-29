import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteIngestMonthEmployeeDayComponent } from './site-ingest-month-employee-day.component';

describe('SiteIngestMonthEmployeeDayComponent', () => {
  let component: SiteIngestMonthEmployeeDayComponent;
  let fixture: ComponentFixture<SiteIngestMonthEmployeeDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteIngestMonthEmployeeDayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteIngestMonthEmployeeDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
