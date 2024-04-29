import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamWorkcodesComponent } from './team-workcodes.component';

describe('TeamWorkcodesComponent', () => {
  let component: TeamWorkcodesComponent;
  let fixture: ComponentFixture<TeamWorkcodesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeamWorkcodesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamWorkcodesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
