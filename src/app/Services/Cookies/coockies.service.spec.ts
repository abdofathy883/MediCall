import { TestBed } from '@angular/core/testing';

import { CoockiesService } from './coockies.service';

describe('CoockiesService', () => {
  let service: CoockiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoockiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
