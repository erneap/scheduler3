import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteIngestFormMonthEmployeeComponent } from './site-ingest-form-month-employee.component';

describe('SiteIngestFormMonthEmployeeComponent', () => {
  let component: SiteIngestFormMonthEmployeeComponent;
  let fixture: ComponentFixture<SiteIngestFormMonthEmployeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteIngestFormMonthEmployeeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteIngestFormMonthEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
