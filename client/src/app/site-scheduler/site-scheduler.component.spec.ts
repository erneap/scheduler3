import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteSchedulerComponent } from './site-scheduler.component';

describe('SiteSchedulerComponent', () => {
  let component: SiteSchedulerComponent;
  let fixture: ComponentFixture<SiteSchedulerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteSchedulerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteSchedulerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
