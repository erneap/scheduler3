import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamSpecialtiesListComponent } from './team-specialties-list.component';

describe('TeamSpecialtiesListComponent', () => {
  let component: TeamSpecialtiesListComponent;
  let fixture: ComponentFixture<TeamSpecialtiesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeamSpecialtiesListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamSpecialtiesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
