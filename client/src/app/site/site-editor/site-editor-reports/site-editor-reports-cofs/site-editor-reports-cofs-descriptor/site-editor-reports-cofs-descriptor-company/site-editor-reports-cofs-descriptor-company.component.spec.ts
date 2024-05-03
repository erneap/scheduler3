import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEditorReportsCofsDescriptorCompanyComponent } from './site-editor-reports-cofs-descriptor-company.component';

describe('SiteEditorReportsCofsDescriptorCompanyComponent', () => {
  let component: SiteEditorReportsCofsDescriptorCompanyComponent;
  let fixture: ComponentFixture<SiteEditorReportsCofsDescriptorCompanyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteEditorReportsCofsDescriptorCompanyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEditorReportsCofsDescriptorCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
