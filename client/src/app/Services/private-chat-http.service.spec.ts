import { TestBed } from '@angular/core/testing';

import { PrivateChatHttpService } from './private-chat-http.service';

describe('PrivateChatHttpService', () => {
  let service: PrivateChatHttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrivateChatHttpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
