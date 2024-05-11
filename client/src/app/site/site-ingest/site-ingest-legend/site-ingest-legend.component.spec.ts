import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteIngestLegendComponent } from './site-ingest-legend.component';

describe('SiteIngestLegendComponent', () => {
  let component: SiteIngestLegendComponent;
  let fixture: ComponentFixture<SiteIngestLegendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteIngestLegendComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteIngestLegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
