import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubventionLogPopupComponent } from './subvention-log-popup.component';

describe('SubventionLogPopupComponent', () => {
  let component: SubventionLogPopupComponent;
  let fixture: ComponentFixture<SubventionLogPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubventionLogPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubventionLogPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
