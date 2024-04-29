import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamSiteEmployeeEditorComponent } from './team-site-employee-editor.component';

describe('TeamSiteEmployeeEditorComponent', () => {
  let component: TeamSiteEmployeeEditorComponent;
  let fixture: ComponentFixture<TeamSiteEmployeeEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeamSiteEmployeeEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamSiteEmployeeEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
