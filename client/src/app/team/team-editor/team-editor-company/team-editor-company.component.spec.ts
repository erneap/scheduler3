import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamEditorCompanyComponent } from './team-editor-company.component';

describe('TeamEditorCompanyComponent', () => {
  let component: TeamEditorCompanyComponent;
  let fixture: ComponentFixture<TeamEditorCompanyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeamEditorCompanyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamEditorCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
