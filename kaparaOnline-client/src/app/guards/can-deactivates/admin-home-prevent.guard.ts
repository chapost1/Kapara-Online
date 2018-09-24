import { Injectable } from '@angular/core';
import { CanDeactivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { FacadeService } from '../../facade_service/facade.service';
import { StoreComponent } from '../../views/store/store/store.component';

@Injectable({
  providedIn: 'root'
})
export class AdminHomePreventGuard implements CanDeactivate<StoreComponent> {

  constructor(private router: Router,
    private facadeService: FacadeService) { }

  canDeactivate(component: StoreComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot): boolean {
    /// if admin only trys to go home without logging out, prevent it. - return false; 
    return (!(currentState.url == '/store' &&
      nextState.url.startsWith("/home") &&
      this.facadeService.user &&
      this.facadeService.user.role == 'admin'));
  };
}
