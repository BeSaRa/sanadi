import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterRequestPopupComponent } from './filter-request-popup.component';

describe('FilterRequestPopupComponent', () => {
  let component: FilterRequestPopupComponent;
  let fixture: ComponentFixture<FilterRequestPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilterRequestPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterRequestPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
