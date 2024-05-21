import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamEditorSiteEditorComponent } from './team-editor-site-editor.component';

describe('TeamEditorSiteEditorComponent', () => {
  let component: TeamEditorSiteEditorComponent;
  let fixture: ComponentFixture<TeamEditorSiteEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeamEditorSiteEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamEditorSiteEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
