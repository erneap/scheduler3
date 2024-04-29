import { TestBed } from '@angular/core/testing';

import { SpinInterceptorInterceptor } from './spin-interceptor.interceptor';

describe('SpinInterceptorInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      SpinInterceptorInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: SpinInterceptorInterceptor = TestBed.inject(SpinInterceptorInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
