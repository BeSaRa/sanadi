import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelRequestPopupComponent } from './cancel-request-popup.component';

describe('CancelRequestPopupComponent', () => {
  let component: CancelRequestPopupComponent;
  let fixture: ComponentFixture<CancelRequestPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CancelRequestPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CancelRequestPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
