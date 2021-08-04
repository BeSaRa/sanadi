import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubventionAidPopupComponent } from './subvention-aid-popup.component';

describe('SubventionAidPopupComponent', () => {
  let component: SubventionAidPopupComponent;
  let fixture: ComponentFixture<SubventionAidPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubventionAidPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubventionAidPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
