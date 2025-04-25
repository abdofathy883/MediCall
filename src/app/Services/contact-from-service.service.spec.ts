import { TestBed } from '@angular/core/testing';

import { ContactFromServiceService } from './contact-from-service.service';

describe('ContactFromServiceService', () => {
  let service: ContactFromServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContactFromServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
