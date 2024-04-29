import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteCofsReportEditorComponent } from './site-cofs-report-editor.component';

describe('SiteCofsReportEditorComponent', () => {
  let component: SiteCofsReportEditorComponent;
  let fixture: ComponentFixture<SiteCofsReportEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteCofsReportEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteCofsReportEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
