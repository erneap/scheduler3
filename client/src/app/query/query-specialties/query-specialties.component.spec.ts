import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuerySpecialtiesComponent } from './query-specialties.component';

describe('QuerySpecialtiesComponent', () => {
  let component: QuerySpecialtiesComponent;
  let fixture: ComponentFixture<QuerySpecialtiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuerySpecialtiesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuerySpecialtiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
