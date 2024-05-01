import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEditorReportsComponent } from './site-editor-reports.component';

describe('SiteEditorReportsComponent', () => {
  let component: SiteEditorReportsComponent;
  let fixture: ComponentFixture<SiteEditorReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteEditorReportsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEditorReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
