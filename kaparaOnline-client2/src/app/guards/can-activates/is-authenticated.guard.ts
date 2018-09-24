import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { FacadeService } from '../../facade_service/facade.service';

@Injectable({
  providedIn: 'root'
})
export class IsAuthenticatedGuard implements CanActivate {

  constructor(public facadeService: FacadeService,
    private router: Router) { }

  public canActivate = async () => {
    this.facadeService.toggleSpinner(true);
    if (!this.facadeService.isAuthenticated) {
      let waitingForUserCheck = await this.facadeService.logInFirst();
    };
    this.facadeService.toggleSpinner(false);
    if (!this.facadeService.isAuthenticated) {
      this.router.navigate(['/home']);
    };
    return this.facadeService.isAuthenticated;
  };
}
