import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamEditorCompanyModtimeComponent } from './team-editor-company-modtime.component';

describe('TeamEditorCompanyModtimeComponent', () => {
  let component: TeamEditorCompanyModtimeComponent;
  let fixture: ComponentFixture<TeamEditorCompanyModtimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeamEditorCompanyModtimeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamEditorCompanyModtimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
