import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupmodComponent } from './signupmod.component';

describe('SignupmodComponent', () => {
  let component: SignupmodComponent;
  let fixture: ComponentFixture<SignupmodComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignupmodComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupmodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
