import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamEditorSiteEditorNewSiteComponent } from './team-editor-site-editor-new-site.component';

describe('TeamEditorSiteEditorNewSiteComponent', () => {
  let component: TeamEditorSiteEditorNewSiteComponent;
  let fixture: ComponentFixture<TeamEditorSiteEditorNewSiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeamEditorSiteEditorNewSiteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamEditorSiteEditorNewSiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
