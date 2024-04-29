import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteReportEditorComponent } from './site-report-editor.component';

describe('SiteReportEditorComponent', () => {
  let component: SiteReportEditorComponent;
  let fixture: ComponentFixture<SiteReportEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteReportEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteReportEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
