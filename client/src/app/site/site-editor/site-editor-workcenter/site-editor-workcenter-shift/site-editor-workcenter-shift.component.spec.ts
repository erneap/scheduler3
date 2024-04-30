import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEditorWorkcenterShiftComponent } from './site-editor-workcenter-shift.component';

describe('SiteEditorWorkcenterShiftComponent', () => {
  let component: SiteEditorWorkcenterShiftComponent;
  let fixture: ComponentFixture<SiteEditorWorkcenterShiftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteEditorWorkcenterShiftComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEditorWorkcenterShiftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
