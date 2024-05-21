import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamEditorSpecialtytypesComponent } from './team-editor-specialtytypes.component';

describe('TeamEditorSpecialtytypesComponent', () => {
  let component: TeamEditorSpecialtytypesComponent;
  let fixture: ComponentFixture<TeamEditorSpecialtytypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeamEditorSpecialtytypesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamEditorSpecialtytypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
