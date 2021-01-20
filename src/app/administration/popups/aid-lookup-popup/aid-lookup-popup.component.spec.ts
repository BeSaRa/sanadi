import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AidLookupPopupComponent } from './aid-lookup-popup.component';

describe('AidLookupPopupComponent', () => {
  let component: AidLookupPopupComponent;
  let fixture: ComponentFixture<AidLookupPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AidLookupPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AidLookupPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
