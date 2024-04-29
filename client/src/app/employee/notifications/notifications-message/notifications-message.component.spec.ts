import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationsMessageComponent } from './notifications-message.component';

describe('NotificationsMessageComponent', () => {
  let component: NotificationsMessageComponent;
  let fixture: ComponentFixture<NotificationsMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotificationsMessageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationsMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
