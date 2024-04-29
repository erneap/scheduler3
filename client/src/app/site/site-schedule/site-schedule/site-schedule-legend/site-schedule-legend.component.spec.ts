import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteScheduleLegendComponent } from './site-schedule-legend.component';

describe('SiteScheduleLegendComponent', () => {
  let component: SiteScheduleLegendComponent;
  let fixture: ComponentFixture<SiteScheduleLegendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteScheduleLegendComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteScheduleLegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
