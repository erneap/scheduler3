import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamListEditorComponent } from './team-list-editor.component';

describe('TeamListEditorComponent', () => {
  let component: TeamListEditorComponent;
  let fixture: ComponentFixture<TeamListEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeamListEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamListEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
