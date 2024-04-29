import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteIngestMonthLegendComponent } from './site-ingest-month-legend.component';

describe('SiteIngestMonthLegendComponent', () => {
  let component: SiteIngestMonthLegendComponent;
  let fixture: ComponentFixture<SiteIngestMonthLegendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteIngestMonthLegendComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteIngestMonthLegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
