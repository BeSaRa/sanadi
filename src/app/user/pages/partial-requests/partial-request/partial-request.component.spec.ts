import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartialRequestComponent } from './partial-request.component';

describe('PartialRequestComponent', () => {
  let component: PartialRequestComponent;
  let fixture: ComponentFixture<PartialRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PartialRequestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PartialRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
