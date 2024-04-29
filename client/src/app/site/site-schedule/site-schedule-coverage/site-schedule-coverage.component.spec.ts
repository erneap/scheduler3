import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteScheduleCoverageComponent } from './site-schedule-coverage.component';

describe('SiteScheduleCoverageComponent', () => {
  let component: SiteScheduleCoverageComponent;
  let fixture: ComponentFixture<SiteScheduleCoverageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteScheduleCoverageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteScheduleCoverageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
