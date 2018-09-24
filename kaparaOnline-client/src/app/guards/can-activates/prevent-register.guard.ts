import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { FacadeService } from '../../facade_service/facade.service';

@Injectable({
  providedIn: 'root'
})
export class PreventRegisterGuard implements CanActivate {
  constructor(public facadeService: FacadeService,
    private router: Router) { }

  public canActivate = async () => {
    this.facadeService.toggleSpinner(true);
    if (!this.facadeService.isAuthenticated) {
      let waitingForUserCheck = await this.facadeService.logInFirst();
    };
    this.facadeService.toggleSpinner(false);
    let user = this.facadeService.user;
    if (this.facadeService.isAuthenticated) {
      if (user.role == 'admin') {
        this.router.navigate(['/store']);
      } else if (user.role == 'guest') {
        this.router.navigate(['home/login']);
      };
    } else {
      return true;
    };
  };
}
