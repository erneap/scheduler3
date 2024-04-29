import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEmployeesVariationComponent } from './site-employees-variation.component';

describe('SiteEmployeesVariationComponent', () => {
  let component: SiteEmployeesVariationComponent;
  let fixture: ComponentFixture<SiteEmployeesVariationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteEmployeesVariationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteEmployeesVariationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
