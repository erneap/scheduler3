import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileIngestComponent } from './file-ingest.component';

describe('FileIngestComponent', () => {
  let component: FileIngestComponent;
  let fixture: ComponentFixture<FileIngestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileIngestComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileIngestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
