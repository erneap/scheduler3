import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteIngestFormMonthComponent } from './site-ingest-form-month.component';

describe('SiteIngestFormMonthComponent', () => {
  let component: SiteIngestFormMonthComponent;
  let fixture: ComponentFixture<SiteIngestFormMonthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteIngestFormMonthComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteIngestFormMonthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
