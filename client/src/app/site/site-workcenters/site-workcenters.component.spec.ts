import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteWorkcentersComponent } from './site-workcenters.component';

describe('SiteWorkcentersComponent', () => {
  let component: SiteWorkcentersComponent;
  let fixture: ComponentFixture<SiteWorkcentersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteWorkcentersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteWorkcentersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
