import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EServicesComponent } from './e-services.component';

describe('EServicesComponent', () => {
  let component: EServicesComponent;
  let fixture: ComponentFixture<EServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EServicesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
