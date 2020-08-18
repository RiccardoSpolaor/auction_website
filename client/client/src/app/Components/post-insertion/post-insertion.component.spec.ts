import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostInsertionComponent } from './post-insertion.component';

describe('PostInsertionComponent', () => {
  let component: PostInsertionComponent;
  let fixture: ComponentFixture<PostInsertionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostInsertionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostInsertionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
