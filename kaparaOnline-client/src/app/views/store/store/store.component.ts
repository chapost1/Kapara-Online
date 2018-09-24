import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FacadeService } from '../../../facade_service/facade.service';
import { ProductModel } from '../../../models/product.model';
import { ProductFormComponent } from '../product-form/product-form.component';
import { ProductsComponent } from '../products/products.component';
import { CartComponent } from '../cart/cart.component';
import { DialogComponent } from '../dialog/dialog.component';
import { CartProductModel } from '../../../models/cartProduct.model';
import { quantityLowAnimation } from '../../../shared/animations/animations';
import { StoreService } from '../services/store.service';
import { OrderModel } from '../../../models/order.model';

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.css'],
  animations: quantityLowAnimation
})
export class StoreComponent implements OnInit, OnDestroy {
  @ViewChild('dialog') dialog: DialogComponent;
  @ViewChild('clientCart') clientCart: CartComponent;
  @ViewChild('productsCont') productsCont: ProductsComponent
  @ViewChild('productForm') productForm: ProductFormComponent;
  public editProduct: ProductModel = null;
  private subscriptions = new Subscription();
  private cartCollapsed: boolean = true;
  public cartSize: string = 'custom-cart-size-1';
  public productsContSize: string = 'custom-products-cont-size-free';
  public cart_display: string = 'none';
  public chosenProductToAdd: ProductModel = null;
  public orderCompleted: boolean = false;
  public orderId: string = null;

  constructor(public facadeService: FacadeService,
    public router: Router,
    private storeService: StoreService) { }

  ngOnInit() {
    this.toggleCartStatePerRole();
    this.subscribeAddingProductViaQuantity();
    this.facadeService.storeState = 'shopping';
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  };

  public toggleEditProduct(product: ProductModel) {
    this.productForm.getProductFromFather(product);
    this.editProduct = product;
    if (this.productForm.changeProdImage) {
      this.productForm.changeProdImage = false;
      setTimeout(() => this.productForm.matProductCheckBox.checked = false, 0);
    };
    this.productForm.toggleProductForm();
  };

  public resetForm() {
    this.productForm.getProductFromFather(null);
    this.productForm.changeProdImage = true;
    this.editProduct = null;
    this.productForm.toggleProductForm(this.productsCont.selectedTab);
    this.productForm.myNgProductForm.resetForm();
  };

  public afterSuccessfulProductChange(categoryNumAndProduct) {
    let categorySelectNum = categoryNumAndProduct[0];
    let filterIn = ['filteredProducts', 'selectedCategoryProducts'];
    let productsSelectedTabId = this.productsCont.categories[this.productsCont.selectedTab]._id;
    if (this.editProduct === null) {
      // post
      let prod = categoryNumAndProduct[1];
      let category = this.productsCont.categories[categorySelectNum];
      let newProduct = new ProductModel(prod._id, prod.name, prod.price, prod.image, category);
      this.productsCont.pushNewProduct(filterIn, newProduct, productsSelectedTabId);
    } else {
      // update
      let updatedProduct = new ProductModel(this.editProduct._id, this.productForm.productFormGroup.value.name,
        this.productForm.productFormGroup.value.price, this.editProduct.image,
        this.productsCont.categories[categorySelectNum]);
      this.productsCont.updateProduct(filterIn, updatedProduct, productsSelectedTabId);
    };
    setTimeout(() => this.resetForm(), 0);
  };

  public controlCartState() {
    if (this.cartCollapsed) {
      this.cartCollapsed = false;
      this.cartSize = 'custom-cart-size-3';
      this.productsContSize = 'custom-products-cont-size-chained';
      this.cart_display = 'block';
    } else {
      this.cartCollapsed = true;
      this.cartSize = 'custom-cart-size-1';
      this.productsContSize = 'custom-products-cont-size-free';
      this.cart_display = 'none';
    }
  };

  public toggleCartStatePerRole() {
    if (this.facadeService.user !== undefined ||
      this.facadeService.user.role == 'admin') {
      this.cartCollapsed = false;
      this.cartSize = 'custom-cart-size-3';
      this.productsContSize = 'custom-products-cont-size-chained';
      this.cart_display = 'block';
    };
  };

  public handleProductAfterClick(product: ProductModel) {
    if (this.facadeService.user !== undefined &&
      this.facadeService.user.role == 'admin') {
      //to form
      this.toggleEditProduct(product);
    } else if (this.facadeService.user !== undefined &&
      this.facadeService.user.role == 'guest') {
      //to cart
      this.chosenProductToAdd = product;
      this.dialog.openQuantityDialog();
    };
  };

  public subscribeAddingProductViaQuantity() {
    this.subscriptions.add(
      this.facadeService.addProductToCart.subscribe(quantity => this.addThatProduct(quantity))
    );
  }

  public addThatProduct(quantity: number) {
    let cartProduct: CartProductModel = new CartProductModel(this.chosenProductToAdd, quantity);
    this.clientCart.pushProductToCart(cartProduct);
    this.chosenProductToAdd = null;
  };

  public getRole(): string {
    return this.facadeService.user.role;
  };

  public preCompleteOrder(orderDetailsMissingCartAndTotal) {
    let cartProducts = this.clientCart.clientCurrentCart.cartProducts;
    let pre = orderDetailsMissingCartAndTotal;
    let order: OrderModel = new OrderModel(pre._id, pre.updatedAt,
      cartProducts, pre.user, pre.city, pre.address, this.clientCart.getTotal(),
      pre.shippingDate, pre.last4Digits);
    this.sendOrderToDb(order);
  };

  public sendOrderToDb(order) {
    // send to Db..
    this.subscriptions.add(
      this.storeService.postUserOrder(order).subscribe(response => {
        if (response.hasOwnProperty('hasError')) {
          //error
          this.facadeService.openSnackBar(response.hasError, 'alert');
        } else {
          this.facadeService.openSnackBar(`Your order has been ordered successfully`, 'success');
          /// everything went ok - response is our order
          this.facadeService.user.orders.push(response);
          this.subscribeResetAfterSuccessfulPurchase();
          this.orderCompleted = true;
          this.orderId = response._id;
          setTimeout(() => this.dialog.openSuccessfulOrderDialog({
            cartComponent: this.clientCart,
            responseId: response._id
          }), 0);
        };
      }, err => this.facadeService.openSnackBar("couldn't communicate server", 'alert'))
    );
  };

  public getToday() {
    return new Date();
  };

  public subscribeResetAfterSuccessfulPurchase() {
    this.subscriptions.add(
      this.facadeService.resetStoreAfterSuccessfulPurchase.subscribe(res => {
        this.orderCompleted = false;
        this.orderId = null;
        this.facadeService.user.cart.cartProducts = [];
        this.clientCart.clientCurrentCart.cartProducts = [];
      })
    );
  };

  public openRemoveCartModal(cartCompShow) {
    this.dialog.openCleanCartDialog(cartCompShow);
  };
}