import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { FacadeService } from '../../../facade_service/facade.service';
import { UserModel } from '../../../models/user.model';
import { StoreService } from '../../store/services/store.service';

@Component({
  selector: 'app-login-panel',
  templateUrl: './login-panel.component.html',
  styleUrls: ['./login-panel.component.css']
})
export class LoginPanelComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  public user: UserModel;
  private notification: any[];
  public store_data: any;

  constructor(public facadeService: FacadeService,
    private storeService: StoreService) {
    this.user = this.facadeService.user;
  }

  ngOnInit() {
    this.subscribeToGettingUser();
    this.subscribeUserGreeter();
    this.subscribeGettingGeneralData();
  };

  subscribeToGettingUser() {
    this.subscriptions.add(
      this.facadeService.loginUserEmitter.subscribe(user => {
        this.user = user;
      })
    );
  };

  subscribeUserGreeter() {
    this.subscriptions.add(
      this.facadeService.loginCPanelGreeter.subscribe(notification => {
        this.notification = notification;
      })
    );
  };

  subscribeGettingGeneralData() {
    this.subscriptions.add(
      this.storeService.handleHomeInit().subscribe(data => {
        if (data.hasOwnProperty('hasError')) {
          this.facadeService.openSnackBar(data.hasError, 'alert');
        } else {
          //data = asked data about store.
          this.store_data = data;
        };
      }, err => this.facadeService.openSnackBar(`Couldn't log in, please try again later.`, 'alert'))
    );
  };

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public getCartItemsNames() {
    if (this.facadeService.user && this.facadeService.user.cart &&
      this.facadeService.user.cart.cartProducts.length > 0) {
      let names: string = '';
      this.facadeService.user.cart.cartProducts.forEach((prod, i) => {
        names += `${i + 1}. ${prod.quantity}x ${prod.product.name}\n`;
      });
      return names;
    };
    return '';
  };

}
