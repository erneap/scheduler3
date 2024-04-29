import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteModReportViewComponent } from './site-mod-report-view.component';

describe('SiteModReportViewComponent', () => {
  let component: SiteModReportViewComponent;
  let fixture: ComponentFixture<SiteModReportViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteModReportViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteModReportViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
