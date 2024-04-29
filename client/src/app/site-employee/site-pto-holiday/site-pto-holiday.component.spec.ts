import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SitePtoHolidayComponent } from './site-pto-holiday.component';

describe('SitePtoHolidayComponent', () => {
  let component: SitePtoHolidayComponent;
  let fixture: ComponentFixture<SitePtoHolidayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SitePtoHolidayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SitePtoHolidayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
