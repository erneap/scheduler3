import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteIngestComponent } from './site-ingest.component';

describe('SiteIngestComponent', () => {
  let component: SiteIngestComponent;
  let fixture: ComponentFixture<SiteIngestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteIngestComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteIngestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
