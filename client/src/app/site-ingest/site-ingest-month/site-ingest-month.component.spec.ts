import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteIngestMonthComponent } from './site-ingest-month.component';

describe('SiteIngestMonthComponent', () => {
  let component: SiteIngestMonthComponent;
  let fixture: ComponentFixture<SiteIngestMonthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteIngestMonthComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteIngestMonthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
