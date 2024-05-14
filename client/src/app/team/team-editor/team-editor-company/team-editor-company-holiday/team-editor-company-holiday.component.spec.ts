import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamEditorCompanyHolidayComponent } from './team-editor-company-holiday.component';

describe('TeamEditorCompanyHolidayComponent', () => {
  let component: TeamEditorCompanyHolidayComponent;
  let fixture: ComponentFixture<TeamEditorCompanyHolidayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeamEditorCompanyHolidayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamEditorCompanyHolidayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
