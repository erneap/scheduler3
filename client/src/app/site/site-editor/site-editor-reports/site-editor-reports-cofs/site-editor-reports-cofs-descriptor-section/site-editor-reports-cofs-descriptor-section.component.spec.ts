import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEditorReportsCofsDescriptorSectionComponent } from './site-editor-reports-cofs-descriptor-section.component';

describe('SiteEditorReportsCofsDescriptorSectionComponent', () => {
  let component: SiteEditorReportsCofsDescriptorSectionComponent;
  let fixture: ComponentFixture<SiteEditorReportsCofsDescriptorSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteEditorReportsCofsDescriptorSectionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEditorReportsCofsDescriptorSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
