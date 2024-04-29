import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteIngestMonthEmployeeComponent } from './site-ingest-month-employee.component';

describe('SiteIngestMonthEmployeeComponent', () => {
  let component: SiteIngestMonthEmployeeComponent;
  let fixture: ComponentFixture<SiteIngestMonthEmployeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteIngestMonthEmployeeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteIngestMonthEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
