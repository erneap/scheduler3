import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamCompanyComponent } from './team-company.component';

describe('TeamCompanyComponent', () => {
  let component: TeamCompanyComponent;
  let fixture: ComponentFixture<TeamCompanyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeamCompanyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
