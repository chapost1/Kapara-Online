import { TestBed, async, inject } from '@angular/core/testing';

import { AdminHomePreventGuard } from './admin-home-prevent.guard';

describe('AdminHomePreventGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminHomePreventGuard]
    });
  });

  it('should ...', inject([AdminHomePreventGuard], (guard: AdminHomePreventGuard) => {
    expect(guard).toBeTruthy();
  }));
});
