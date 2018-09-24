import { NgModule } from '@angular/core';
import { SharedModule } from "../../shared/shared.module";
import { RouterModule } from "@angular/router";
import { StoreRoutes } from "./storeRoutes.router";
import {
  MatTabsModule,
  MatDialogModule,
  MatDialogRef
} from '@angular/material';

import { StoreComponent } from './store/store.component';
import { CartComponent } from './cart/cart.component';
import { ProductsComponent } from './products/products.component';
import { ProductComponent } from './product/product.component';
import { ProductFormComponent } from './product-form/product-form.component';
import { HeIlCurrencyFormatPipe } from './pipes/currency-format.pipe';
import {
  DialogComponent,
  DialogOverviewExampleDialog
} from './dialog/dialog.component';
import { HighlightSearch } from './pipes/hightlight-pipe.pipe';
import {
  OrderFormComponent,
  CreditCardDirective
} from './order-form/order-form.component';

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild(StoreRoutes.routes),
    MatTabsModule,
    MatDialogModule
  ],
  declarations: [
    StoreComponent,
    CartComponent,
    ProductsComponent,
    ProductComponent,
    ProductFormComponent,
    HeIlCurrencyFormatPipe,
    DialogComponent,
    DialogOverviewExampleDialog,
    HighlightSearch,
    OrderFormComponent,
    CreditCardDirective
  ],
  exports: [
    MatTabsModule,
    MatDialogModule
  ],
  entryComponents: [
    DialogOverviewExampleDialog
  ],
  providers: [{ provide: MatDialogRef, useValue: {} },]
})
export class StoreModule { }
