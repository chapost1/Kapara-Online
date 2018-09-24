import { Injectable, EventEmitter, OnDestroy } from '@angular/core';
import { UserModel } from '../models/user.model';
import { UsersService } from '../views/home/services/users.service';
import { MatSnackBar } from '@angular/material';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class FacadeService implements OnDestroy {
  private subscriptions = new Subscription();
  public isAuthenticated: boolean = false;
  public user: UserModel;
  public headerUserEmitter: EventEmitter<UserModel> = new EventEmitter<UserModel>();
  public loginUserEmitter: EventEmitter<UserModel> = new EventEmitter<UserModel>();
  public loginCPanelGreeter: EventEmitter<any> = new EventEmitter<any>();
  public spinnerEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();
  public bottomSheetsMessagesEmitter: EventEmitter<string> = new EventEmitter<string>();
  public searchShoppingFilterEmitter: EventEmitter<any> = new EventEmitter<any>();
  public searchOrderFilterEmitter: EventEmitter<any> = new EventEmitter<any>();
  public filtering: boolean = false;
  public addProductToCart: EventEmitter<number> = new EventEmitter<number>();
  public storeState: string = '';
  public resetStoreAfterSuccessfulPurchase: EventEmitter<any> = new EventEmitter<any>();

  constructor(private usersService: UsersService,
    private router: Router,
    public snackBar: MatSnackBar) { }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public toggleSpinner(bool: boolean) {
    this.spinnerEmitter.emit(bool);
  };

  public openSnackBar(message: string, method: string) {
    this.snackBar.open(message, 'DISMISS', {
      duration: 5000,
      panelClass: [`${method}-snackbar`]
    });
  };

  public assignNewUser(user: UserModel) {
    this.isAuthenticated = true;
    user.first = this.capitalizeFirstLetter(user.first);
    this.user = user;
    this.handleUserEmitters(user);
    if (this.router.url == "/home/login")
      this.router.navigate(['/home']);
  };

  public logOut() {
    this.isAuthenticated = false;
    this.user = null;
    this.handleUserEmitters(null);
    if (this.router.url == "/home/login")
      this.router.navigate(['/home']);
    else
      this.router.navigate(['/home/login']);
  };

  public handleUserEmitters(user: UserModel) {
    this.headerUserEmitter.emit(user);
    if (this.router.url == "/home/login") {
      this.greetUserWithLastVisitAnnounce(user);
      this.loginUserEmitter.emit(user);
    };
  };

  public greetUserWithLastVisitAnnounce(user: UserModel) {
    let notification: string = '';
    if (user) {
      // not null
      if (user.hasOwnProperty('cart') ? user.cart !== undefined ? (user.cart.hasOwnProperty('cartProducts') ?
        user.cart.cartProducts.length > 0 : false) : false : false) {
        //open cart obj
        notification = 'cart';
      } else if (user.hasOwnProperty('orders') && user.orders.length > 0) {
        //has orders
        notification = 'orders';
      } else {
        // default
        notification += `<p>Welcome ${user.first}!<p>`;
      };
    };
    setTimeout(() => { this.loginCPanelGreeter.emit(notification); }, 0);
  };

  public logInFirst(): Promise<any> {
    return new Promise((resolve) => {
      this.subscriptions.add(
        this.usersService.checkIfHasSession().subscribe(res => {
          if (res.hasOwnProperty('hasError')) {
            this.openSnackBar("Couldn't communicate server", 'alert');
            resolve(null);
          } else if (res.hasOwnProperty('noUser')) {
            //no session it's ok.
            resolve(null);
          } else {
            //our user
            let user = new UserModel(res._id, res.first, res.last, res.username, res.city,
              res.address, res.role, res.cart, res.orders);
            this.assignNewUser(user);
            resolve(null);
          };
        })
      );
    });
  };

  public capitalizeFirstLetter(string) {
    return string.toLowerCase().charAt(0).toUpperCase() + string.slice(1);
  };

  public bottomSheetMessage(message: string) {
    this.bottomSheetsMessagesEmitter.emit(message);
  };

  public handleSearchViaHeader(key: string) {
    if (key.length > 0)
      this.filtering = true;
    else
      this.filtering = false;
    if (this.storeState == 'shopping') {
      this.searchShoppingFilterEmitter.emit(key);
    } else {
      this.searchOrderFilterEmitter.emit(key);
    };
  };

  public addProductToCartHandle(quantity: number) {
    this.addProductToCart.emit(quantity);
  };

  public toggleStoreState() {
    if (this.storeState == 'shopping') {
      this.storeState = 'order';
    } else {
      this.storeState = 'shopping';
    };
    let searchKeyOfHeader = document.getElementById('searchKeyOfHeader');
    setTimeout(() => {
      if (searchKeyOfHeader !== undefined || searchKeyOfHeader !== null) {
        searchKeyOfHeader.click();;
      };
    }, 0);
  };

  public resetStoreAfterSuccessfulPurchaseHandler() {
    this.resetStoreAfterSuccessfulPurchase.emit();
    this.toggleStoreState();
    setTimeout(() => {
      this.router.navigate(['home']);
    }, 0);
  };
}
