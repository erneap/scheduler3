import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamCompanyModtimeComponent } from './team-company-modtime.component';

describe('TeamCompanyModtimeComponent', () => {
  let component: TeamCompanyModtimeComponent;
  let fixture: ComponentFixture<TeamCompanyModtimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeamCompanyModtimeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamCompanyModtimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
