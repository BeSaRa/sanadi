import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AidLookupContainerComponent } from './aid-lookup-container.component';

describe('AidLookupContainerComponent', () => {
  let component: AidLookupContainerComponent;
  let fixture: ComponentFixture<AidLookupContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AidLookupContainerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AidLookupContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
