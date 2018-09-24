import { TestBed, async, inject } from '@angular/core/testing';

import { PreventRegisterGuard } from './prevent-register.guard';

describe('PreventRegisterGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PreventRegisterGuard]
    });
  });

  it('should ...', inject([PreventRegisterGuard], (guard: PreventRegisterGuard) => {
    expect(guard).toBeTruthy();
  }));
});
