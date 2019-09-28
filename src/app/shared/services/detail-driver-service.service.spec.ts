import { TestBed } from '@angular/core/testing';

import { DetailDriverServiceService } from './detail-driver-service.service';

describe('DetailDriverServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DetailDriverServiceService = TestBed.get(DetailDriverServiceService);
    expect(service).toBeTruthy();
  });
});
