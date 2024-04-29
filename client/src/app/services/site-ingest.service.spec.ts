import { TestBed } from '@angular/core/testing';

import { SiteIngestService } from './site-ingest.service';

describe('SiteIngestService', () => {
  let service: SiteIngestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SiteIngestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
