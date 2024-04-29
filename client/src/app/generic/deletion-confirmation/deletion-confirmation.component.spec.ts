import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletionConfirmationComponent } from './deletion-confirmation.component';

describe('DeletionConfirmationComponent', () => {
  let component: DeletionConfirmationComponent;
  let fixture: ComponentFixture<DeletionConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeletionConfirmationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeletionConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
