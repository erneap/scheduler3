import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEditorReportsCofsComponent } from './site-editor-reports-cofs.component';

describe('SiteEditorReportsCofsComponent', () => {
  let component: SiteEditorReportsCofsComponent;
  let fixture: ComponentFixture<SiteEditorReportsCofsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteEditorReportsCofsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEditorReportsCofsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
