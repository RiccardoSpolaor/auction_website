import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InsertionListComponent } from './insertion-list.component';

describe('InsertionListComponent', () => {
  let component: InsertionListComponent;
  let fixture: ComponentFixture<InsertionListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsertionListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsertionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
