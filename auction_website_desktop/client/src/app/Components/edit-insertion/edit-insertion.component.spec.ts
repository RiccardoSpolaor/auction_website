import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditInsertionComponent } from './edit-insertion.component';

describe('EditInsertionComponent', () => {
  let component: EditInsertionComponent;
  let fixture: ComponentFixture<EditInsertionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditInsertionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditInsertionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
