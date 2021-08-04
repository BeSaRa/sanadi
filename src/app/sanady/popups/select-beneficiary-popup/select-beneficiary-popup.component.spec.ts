import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectBeneficiaryPopupComponent } from './select-beneficiary-popup.component';

describe('SelectBeneficiaryPopupComponent', () => {
  let component: SelectBeneficiaryPopupComponent;
  let fixture: ComponentFixture<SelectBeneficiaryPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectBeneficiaryPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectBeneficiaryPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
