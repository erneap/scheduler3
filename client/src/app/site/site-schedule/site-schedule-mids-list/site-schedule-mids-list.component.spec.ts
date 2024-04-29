import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteScheduleMidsListComponent } from './site-schedule-mids-list.component';

describe('SiteScheduleMidsListComponent', () => {
  let component: SiteScheduleMidsListComponent;
  let fixture: ComponentFixture<SiteScheduleMidsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteScheduleMidsListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteScheduleMidsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
