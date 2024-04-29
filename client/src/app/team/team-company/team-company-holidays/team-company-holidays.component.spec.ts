import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamCompanyHolidaysComponent } from './team-company-holidays.component';

describe('TeamCompanyHolidaysComponent', () => {
  let component: TeamCompanyHolidaysComponent;
  let fixture: ComponentFixture<TeamCompanyHolidaysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeamCompanyHolidaysComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamCompanyHolidaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
