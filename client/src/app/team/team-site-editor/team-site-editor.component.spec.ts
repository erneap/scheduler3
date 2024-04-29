import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamSiteEditorComponent } from './team-site-editor.component';

describe('TeamSiteEditorComponent', () => {
  let component: TeamSiteEditorComponent;
  let fixture: ComponentFixture<TeamSiteEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeamSiteEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamSiteEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
