import { Injectable } from '@angular/core';
import { Router, Resolve } from '@angular/router';
import { FacadeService } from '../../facade_service/facade.service';

@Injectable({
  providedIn: 'root'
})
export class MakeSureHasUserGuard implements Resolve<any> {
  constructor(public facadeService: FacadeService,
    private router: Router) { }

  public resolve = async () => {
    this.facadeService.toggleSpinner(true);
    if (!this.facadeService.isAuthenticated) {
      let waitingForUserCheck = await this.facadeService.logInFirst();
    };
    this.facadeService.toggleSpinner(false);
    return 'value';
  };
}
