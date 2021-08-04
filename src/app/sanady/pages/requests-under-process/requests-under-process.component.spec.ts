import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestsUnderProcessComponent } from './requests-under-process.component';

describe('RequestsUnderProcessComponent', () => {
  let component: RequestsUnderProcessComponent;
  let fixture: ComponentFixture<RequestsUnderProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequestsUnderProcessComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestsUnderProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
