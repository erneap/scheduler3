import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamContactListComponent } from './team-contact-list.component';

describe('TeamContactListComponent', () => {
  let component: TeamContactListComponent;
  let fixture: ComponentFixture<TeamContactListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeamContactListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamContactListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
