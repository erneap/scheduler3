import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteIngestFormComponent } from './site-ingest-form.component';

describe('SiteIngestFormComponent', () => {
  let component: SiteIngestFormComponent;
  let fixture: ComponentFixture<SiteIngestFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteIngestFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteIngestFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
