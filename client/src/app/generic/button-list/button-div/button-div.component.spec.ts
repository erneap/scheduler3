import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonDivComponent } from './button-div.component';

describe('ButtonDivComponent', () => {
  let component: ButtonDivComponent;
  let fixture: ComponentFixture<ButtonDivComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ButtonDivComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonDivComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
