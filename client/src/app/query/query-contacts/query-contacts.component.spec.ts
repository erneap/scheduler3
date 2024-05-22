import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryContactsComponent } from './query-contacts.component';

describe('QueryContactsComponent', () => {
  let component: QueryContactsComponent;
  let fixture: ComponentFixture<QueryContactsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QueryContactsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QueryContactsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
