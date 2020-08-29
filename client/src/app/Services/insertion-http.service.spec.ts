import { TestBed, inject } from '@angular/core/testing';

import { InsertionHttpService } from './insertion-http.service';

describe('InsertionHttpService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InsertionHttpService]
    });
  });

  it('should be created', inject([InsertionHttpService], (service: InsertionHttpService) => {
    expect(service).toBeTruthy();
  }));
});
