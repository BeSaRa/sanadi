import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AidLookupComponent } from './aid-lookup.component';

describe('AidLookupComponent', () => {
  let component: AidLookupComponent;
  let fixture: ComponentFixture<AidLookupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AidLookupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AidLookupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
