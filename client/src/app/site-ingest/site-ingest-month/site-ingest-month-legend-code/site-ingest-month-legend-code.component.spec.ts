import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteIngestMonthLegendCodeComponent } from './site-ingest-month-legend-code.component';

describe('SiteIngestMonthLegendCodeComponent', () => {
  let component: SiteIngestMonthLegendCodeComponent;
  let fixture: ComponentFixture<SiteIngestMonthLegendCodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteIngestMonthLegendCodeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteIngestMonthLegendCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
