/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ExternalOrgAffiliationApprovePopupComponent } from './external-org-affiliation-approve-popup.component';

describe('ExternalOrgAffiliationApprovePopupComponent', () => {
  let component: ExternalOrgAffiliationApprovePopupComponent;
  let fixture: ComponentFixture<ExternalOrgAffiliationApprovePopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExternalOrgAffiliationApprovePopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExternalOrgAffiliationApprovePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
