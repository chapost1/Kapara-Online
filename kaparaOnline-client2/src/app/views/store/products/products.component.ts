import { Component, OnInit, OnDestroy, EventEmitter, Output, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { StoreService } from '../services/store.service';
import { FacadeService } from '../../../facade_service/facade.service';
import { ProductModel } from '../../../models/product.model';
import { CategoryModel } from '../../../models/category.model';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  public categories: CategoryModel[] = [];
  public selectedCategoryProducts: ProductModel[] = [];
  public filteredProducts: ProductModel[] = [];
  public filterKey: string = '';
  @Output() productsEmitter: EventEmitter<ProductModel> = new EventEmitter<ProductModel>();
  @Input() cartCollapsed: boolean;
  public productsWaitSpinner: boolean = true;
  public selectedTab: number = 0;

  constructor(private storeService: StoreService,
    public facadeService: FacadeService) { }

  ngOnInit() {
    this.subscribeAndGetCategories();
    this.subscribeSearchFilter();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public subscribeAndGetCategories() {
    this.subscriptions.add(
      this.storeService.getAllCategories().subscribe(categories => {
        if (categories.hasOwnProperty('hasError')) {
          //error
          this.facadeService.openSnackBar(categories.hasError, 'alert');
        } else {
          categories.forEach(category => {
            this.categories.push(new CategoryModel(category._id, category.name));
          });
          this.findCategory(categories[0]._id);
        }
      }, err => this.facadeService.openSnackBar("couldn't communicate server", 'alert'))
    );
  };

  public findCategory(categoryId: string) {
    this.subscriptions.add(
      this.storeService.getCategoryProducts(categoryId).subscribe(result => {
        if (result.hasOwnProperty('hasError')) {
          //error
          this.facadeService.openSnackBar(result.hasError, 'alert');
        } else {
          //our products
          this.selectedCategoryProducts = result;
        };
        resolver(this);
      }, err => {
        this.facadeService.openSnackBar("couldn't communicate server", 'alert');
        resolver(this);
      })
    );
    function resolver(component) {
      setTimeout(() => {
        component.productsWaitSpinner = false;
      }, 50);
    };
  };

  public updateProduct(arraysToUpdate: string[], updatedProduct: ProductModel, productsSelectedTabId: string) {
    for (let j = 0; j < arraysToUpdate.length; j++) {
      const arrayToUpdate = this[arraysToUpdate[j]];
      arrayToUpdate.forEach((prod, i) => {
        if (prod._id == updatedProduct._id) {
          arrayToUpdate[i] = updatedProduct;
        };
      });
      if (j === 0 && this.facadeService.filtering && this.filterKey.length > 0) {
        let re = new RegExp(this.filterKey, 'gi');
        arrayToUpdate.forEach((prod, i) => {
          if (prod._id == updatedProduct._id && updatedProduct.name.search(re) === -1) {
            arrayToUpdate.splice(i, 1);
          };
        });
      } else if (j === 1) {
        arrayToUpdate.forEach((prod, i) => {
          if (prod._id == updatedProduct._id && productsSelectedTabId != updatedProduct.category._id) {
            arrayToUpdate.splice(i, 1);
          };
        });
      };
    };
  };

  public pushNewProduct(arraysToUpdate: string[], newProduct: ProductModel, productsSelectedTabId: string) {
    for (let j = 0; j < arraysToUpdate.length; j++) {
      const arrayToUpdate = this[arraysToUpdate[j]];
      if (j === 0 && this.facadeService.filtering && this.filterKey.length > 0) {
        let re = new RegExp(this.filterKey, 'gi');
        if (newProduct.name.search(re) !== -1) {
          arrayToUpdate.push(newProduct);
        };
      } else if (j === 1 && productsSelectedTabId == newProduct.category._id) {
        arrayToUpdate.push(newProduct);
      };
    };
  };

  public handleProductClick(product: ProductModel) {
    this.productsEmitter.emit(product);
  };

  public tabChangeEvent(event) {
    this.selectedTab = event.index;
    this.productsWaitSpinner = true;
    // get category from api
    this.findCategory(this.categories[event.index]._id);
  };

  public subscribeSearchFilter() {
    this.subscriptions.add(
      this.facadeService.searchShoppingFilterEmitter.subscribe(filterKey => {
        this.productsWaitSpinner = true;
        this.filterKey = filterKey;
        this.storeService.getProductsViaName(filterKey).subscribe(response => {
          if (response.hasOwnProperty('hasError')) {
            //error
            this.facadeService.openSnackBar(response.hasError, 'alert');
          } else {
            this.filteredProducts = response;
          };
          this.productsWaitSpinner = false;
        }, err => {
          this.facadeService.openSnackBar("couldn't communicate server", 'alert');
          this.productsWaitSpinner = false;
        })
      })
    );
  };
}
