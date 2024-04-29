import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveInformationComponent } from './leave-information.component';

describe('LeaveInformationComponent', () => {
  let component: LeaveInformationComponent;
  let fixture: ComponentFixture<LeaveInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeaveInformationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
