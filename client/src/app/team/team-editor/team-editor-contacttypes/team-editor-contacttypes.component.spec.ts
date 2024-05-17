import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamEditorContacttypesComponent } from './team-editor-contacttypes.component';

describe('TeamEditorContacttypesComponent', () => {
  let component: TeamEditorContacttypesComponent;
  let fixture: ComponentFixture<TeamEditorContacttypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeamEditorContacttypesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamEditorContacttypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
