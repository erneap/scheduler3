import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteScheduleAllComponent } from './site-schedule-all.component';

describe('SiteScheduleAllComponent', () => {
  let component: SiteScheduleAllComponent;
  let fixture: ComponentFixture<SiteScheduleAllComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteScheduleAllComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteScheduleAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
