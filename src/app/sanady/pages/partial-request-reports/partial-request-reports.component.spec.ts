import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartialRequestReportsComponent } from './partial-request-reports.component';

describe('PartialRequestReportsComponent', () => {
  let component: PartialRequestReportsComponent;
  let fixture: ComponentFixture<PartialRequestReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PartialRequestReportsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PartialRequestReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
