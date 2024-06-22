import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamEditorSitesComponent } from './team-editor-sites.component';

describe('TeamEditorSitesComponent', () => {
  let component: TeamEditorSitesComponent;
  let fixture: ComponentFixture<TeamEditorSitesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TeamEditorSitesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamEditorSitesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
