import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PtoMonthComponent } from './pto-month.component';

describe('PtoMonthComponent', () => {
  let component: PtoMonthComponent;
  let fixture: ComponentFixture<PtoMonthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PtoMonthComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PtoMonthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
