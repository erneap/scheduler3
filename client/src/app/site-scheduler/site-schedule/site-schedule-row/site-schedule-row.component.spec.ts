import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteScheduleRowComponent } from './site-schedule-row.component';

describe('SiteScheduleRowComponent', () => {
  let component: SiteScheduleRowComponent;
  let fixture: ComponentFixture<SiteScheduleRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteScheduleRowComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteScheduleRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
