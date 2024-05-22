import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTeamsEditorComponent } from './admin-teams-editor.component';

describe('AdminTeamsEditorComponent', () => {
  let component: AdminTeamsEditorComponent;
  let fixture: ComponentFixture<AdminTeamsEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminTeamsEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminTeamsEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
