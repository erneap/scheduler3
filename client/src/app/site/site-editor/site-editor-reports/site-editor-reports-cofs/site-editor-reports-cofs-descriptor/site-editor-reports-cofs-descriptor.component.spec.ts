import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEditorReportsCofsDescriptorComponent } from './site-editor-reports-cofs-descriptor.component';

describe('SiteEditorReportsCofsDescriptorComponent', () => {
  let component: SiteEditorReportsCofsDescriptorComponent;
  let fixture: ComponentFixture<SiteEditorReportsCofsDescriptorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteEditorReportsCofsDescriptorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEditorReportsCofsDescriptorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
