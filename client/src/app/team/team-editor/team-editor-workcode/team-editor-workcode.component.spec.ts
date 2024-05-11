import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamEditorWorkcodeComponent } from './team-editor-workcode.component';

describe('TeamEditorWorkcodeComponent', () => {
  let component: TeamEditorWorkcodeComponent;
  let fixture: ComponentFixture<TeamEditorWorkcodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeamEditorWorkcodeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamEditorWorkcodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
