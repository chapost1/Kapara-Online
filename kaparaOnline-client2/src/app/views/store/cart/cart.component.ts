import { Component, OnInit, OnDestroy, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { FacadeService } from '../../../facade_service/facade.service';
import { CartProductModel } from '../../../models/cartProduct.model';
import { CartModel } from '../../../models/cart.model';
import { StoreService } from '../services/store.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit, OnDestroy {
  @Output() cleanCartEmitter: EventEmitter<any> = new EventEmitter<any>();
  public showImage: boolean = false;
  public clientCurrentCart: CartModel = new CartModel(this.getCartId(), new Date(),
    [], this.facadeService.user._id);
  public subscriptions = new Subscription();
  public filterBy: string = '';
  public cartTableClass: string = 'cart-table-container';


  constructor(public facadeService: FacadeService,
    private storeService: StoreService,
    public cdRef:ChangeDetectorRef) { }

  ngOnInit() {
    this.keepUpWithPreviousCart();
    this.subscribeGettingHiglightMarker();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public pushProductToCart(newCartProduct: CartProductModel) {
    let added = false;
    this.clientCurrentCart.cartProducts.forEach((cartProduct, i) => {
      if (cartProduct.product._id == newCartProduct.product._id) {
        this.clientCurrentCart.cartProducts[i].quantity += newCartProduct.quantity;
        added = true;
      }
    });
    if (!added) {
      this.clientCurrentCart.cartProducts.push(newCartProduct);
    };
    // update in Db
    this.updateCartStateInDb();
  };

  public removeFromCart(id: string) {
    this.clientCurrentCart.cartProducts.forEach((cartProduct, i) => {
      if (cartProduct.product._id == id) {
        this.clientCurrentCart.cartProducts.splice(i, 1);
      };
    });
    // update in Db
    this.updateCartStateInDb();
  };

  public updateCartStateInDb() {
    this.clientCurrentCart.updatedAt = new Date();
    this.clientCurrentCart.user = this.facadeService.user._id;
    this.facadeService.user.cart = this.clientCurrentCart;
    this.subscriptions.add(
      this.storeService.updateUserCart(this.clientCurrentCart).subscribe(response => {
        if (response.hasOwnProperty('hasError')) {
          //error
          this.facadeService.openSnackBar(response.hasError, 'alert');
        } else {
          /// everything went ok - response is our new cart
          let cart = new CartModel(response._id, new Date(response.updatedAt), response.cartProducts,
            parseInt(response.user));
          this.facadeService.user.cart = cart;
          this.clientCurrentCart = cart;
        };
      }, err => this.facadeService.openSnackBar("couldn't communicate server", 'alert'))
    );
  };

  public getCartId() {
    if (this.facadeService.user &&
      this.facadeService.user.cart &&
      this.facadeService.user.cart._id) {
      return this.facadeService.user.cart._id;
    } else {
      return '';
    };
  };

  public keepUpWithPreviousCart() {
    if (this.facadeService.user && this.facadeService.user.cart) {
      this.facadeService.user.cart.cartProducts.forEach(cartProduct => {
        this.clientCurrentCart.cartProducts.push(new CartProductModel(cartProduct.product, cartProduct.quantity));
      });
    };
  };

  public getTotal() {
    let total: number = 0;
    this.clientCurrentCart.cartProducts.forEach(cartProduct => {
      total += cartProduct.product.price * cartProduct.quantity;
    });
    return total;
  };

  public subscribeGettingHiglightMarker() {
    this.subscriptions.add(
      this.facadeService.searchOrderFilterEmitter.subscribe(filterKey => {
        this.filterBy = filterKey;
      })
    );
  };

  public callToCleanCartDialog() {
    // cart comp show
    this.cleanCartEmitter.emit(this);
  };

  public cleanCart() {
    this.clientCurrentCart.cartProducts = [];
    this.updateCartStateInDb();
  };

}
