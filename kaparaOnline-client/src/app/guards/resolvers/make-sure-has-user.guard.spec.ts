import { TestBed, async, inject } from '@angular/core/testing';

import { MakeSureHasUserGuard } from './make-sure-has-user.guard';

describe('MakeSureHasUserGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MakeSureHasUserGuard]
    });
  });

  it('should ...', inject([MakeSureHasUserGuard], (guard: MakeSureHasUserGuard) => {
    expect(guard).toBeTruthy();
  }));
});
