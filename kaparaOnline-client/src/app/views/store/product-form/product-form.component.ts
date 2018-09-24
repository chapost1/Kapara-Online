import { Component, OnInit, OnDestroy, ViewChild, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FacadeService } from '../../../facade_service/facade.service';
import { ProductModel } from '../../../models/product.model';
import { StoreService } from '../services/store.service';
import { CategoryModel } from '../../../models/category.model';
import { MatCheckbox } from '@angular/material';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit, OnDestroy {
  @ViewChild('myNgProductForm') myNgProductForm: NgForm;
  @Output() successfulChangeEmitter: EventEmitter<any[]> = new EventEmitter<any[]>();
  @ViewChild('matProductCheckBox') matProductCheckBox: MatCheckbox;
  private subscriptions = new Subscription();
  public categories: CategoryModel[] = [];
  public categorySelectNum: number;
  public productFormGroup: FormGroup;
  public editProduct: ProductModel;
  public previewImagePath: string = '';
  public imageFile_errors: any = {};
  public changeProdImage: boolean = true;
  public prodFormData: FormData = new FormData();
  public currentFile: any;

  constructor(private _formBuilder: FormBuilder,
    private storeService: StoreService,
    public facadeService: FacadeService) { }

  ngOnInit() {
    this.subscribeAndGetCategories();
    this.toggleProductForm();
  };

  public toggleProductForm(selectedTab?: number) {
    let takeCategoryFromTab = (!this.facadeService.filtering && selectedTab ||
      !this.facadeService.filtering && selectedTab === 0);
    this.productFormGroup = this._formBuilder.group({
      name: [
        this.editProductName(), [
          Validators.required
        ]
      ],
      price: [
        this.editProductPrice(), [
          Validators.required,
          Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/),
          this.minimumPrice,
          this.checkEndInZero
        ],
      ],
      imageFile: [
        this.editProductImageFile(), [
        ]
      ],
      category: [
        takeCategoryFromTab ? this.categories[selectedTab].name : this.editProductCategory(),
        [
          Validators.required
        ]
      ],
    });
  };

  public getProductFromFather(editProduct: ProductModel) {
    this.editProduct = editProduct;
  };

  // form value setters
  public editProductName() {
    if (this.editProduct)
      return this.editProduct.name;
    else
      return '';
  };

  public editProductPrice() {
    if (this.editProduct)
      return this.editProduct.price;
    else
      return 0;
  };

  public editProductImage() {
    if (this.editProduct) {
      return this.editProduct.image;
    }
    else
      return '';
  };

  public editProductImageFile() {
    if (this.editProduct) {
      this.changeProdImage = false;
      delete this.imageFile_errors.hasError;
      this.previewImagePath = this.editProduct.image;
    } else {
      this.changeProdImage = true;
      this.imageFile_errors.hasError = 'required';
      this.previewImagePath = '';
    };
    return '';
  }

  public editProductCategory() {
    if (this.editProduct) {
      return this.editProduct.category.name;
    };
  };


  public minimumPrice(control: AbstractControl) {
    if (control.value === null) {
      return { hasError: `1 dot only allowed - '.'` };
    }
    else if (control.value > 0) {
      return null;
    } else {
      return { hasError: `Minimum Price is 0.10 ₪` };
    };
  };

  public checkEndInZero(control: AbstractControl) {
    if (control.value > 0) {
      let float = parseFloat(control.value);
      let val = parseInt(float.toFixed(2).split('.')[1]);
      let ok = (val % 10 == 0);
      if (ok)
        return null;
      else
        return { hasError: `Price Must End in .x10` };
    };
    return null;
  };

  public priceValueAddHandleZero(e?: any) {
    let value = this.productFormGroup.get('price').value;
    if (value !== null &&
      value > 0 &&
      value.toString().indexOf('.') !== -1 &&
      (e ? e.keyCode !== 8 : true)) {
      let val = value.toString().split('.')[1];
      if (val.length === 1) {
        this.productFormGroup.get('price').setValue(value.toFixed(2));
      };
    };
  };

  public checkPriceInputFocus() {
    let dummyEl = document.querySelectorAll('input#mat-input-1.mat-input-number-product-form-price')[0];
    // check for focus
    let isFocused = (document.activeElement === dummyEl);
    return isFocused;
  };

  public preventWrongKeys(e) {
    let invalidChars = ["-", "+", "e"];
    let value = this.productFormGroup.get('price').value;
    if ((value === null || value === undefined) && e.keyCode === 190) {
      e.preventDefault();
    } else if (value !== null && value.toString().indexOf('.') !== -1 && e.keyCode === 190) {
      e.preventDefault();
    }
    else if (invalidChars.includes(e.key)) {
      e.preventDefault();
    };
  };

  public subscribeAndGetCategories() {
    this.subscriptions.add(
      this.storeService.getAllCategories().subscribe(categories => {
        this.categories = categories;
      }, err => this.facadeService.openSnackBar("couldn't communicate server", 'alert'))
    );
  };

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public openFileInput() {
    document.getElementById('imageFileInput').click();
  }

  public checkChangeProdImage(event) {
    this.changeProdImage = event.checked;
    if (!event.checked) {
      this.previewImagePath = this.editProduct.image;
      delete this.imageFile_errors.hasError;
    } else {
      this.productFormGroup.get('imageFile').setValue('');
      this.previewImagePath = '';
      this.imageFile_errors.hasError = 'required';
    };
  }

  public fileUpload_mTor(event) {
    let qualified: boolean = false;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp'];
    let checkFileMimeType = (file_type): boolean => {
      for (const type of allowedTypes) {
        if (file_type == type) {
          delete this.imageFile_errors.hasError;
          return true;
        };
      };
      this.imageFile_errors.hasError = 'Images Only';
      return false;
    };
    let checkFileSize = (file_size): boolean => {
      if (4000000 >= file_size) {
        delete this.imageFile_errors.hasError;
        return true;
      };
      this.imageFile_errors.hasError = 'Maximum Size is 2MB';
      return false;
    };
    if (event.target.files && event.target.files.length > 0) {
      delete this.imageFile_errors.hasError;
      let file = event.target.files[0];
      if (file && checkFileMimeType(file.type) && checkFileSize(file.size)) {
        let reader = new FileReader();
        reader.onload = (e: any) => {
          this.previewImagePath = e.target.result;
        }
        reader.readAsDataURL(file);
        this.currentFile = file;
        qualified = true;
      };
    } else {
      /// required will handle it.
      this.imageFile_errors.hasError = 'required';
      this.previewImagePath = '';
    };
    if (!qualified)
      this.previewImagePath = '';
  };

  public handleProductSubmit() {
    if (this.productFormGroup.valid && !this.imageFile_errors.hasError) {
      // form data modifying
      this.prodFormData = new FormData();
      let prod = this.productFormGroup.value;
      this.categories.forEach((category, i) => {
        if (prod.category == category.name) {
          prod.category = this.categories[i]._id;
          this.categorySelectNum = i;
        };
      });
      delete prod.imageFile;
      for (var key in prod) {
        this.prodFormData.append(key, prod[key]);
      };
      // specific 
      if (this.editProduct === null ||
        this.editProduct === undefined) {
        this.prodFormData.append('file', this.currentFile, this.currentFile.name);
        this.postNewProduct();
      } else {
        //update
        if (this.changeProdImage) {
          /// only if does upload new image to server.
          this.prodFormData.append('file', this.currentFile, this.currentFile.name);
        };
        this.prodFormData.append('_id', this.editProduct._id);
        this.updateProduct();
      };
    };
  };

  public postNewProduct() {
    this.subscriptions.add(
      this.storeService.addNewProduct(this.prodFormData).subscribe(product => {
        if (product.hasOwnProperty('hasError')) {
          //error
          this.facadeService.openSnackBar(product.hasError, 'alert');
        } else {
          /// everything went ok
          this.successfulChangeEmitter.emit([this.categorySelectNum,product]);
          this.facadeService.openSnackBar(`${product.name} has been added!`, 'success');
        };
      }, err => this.facadeService.openSnackBar("couldn't communicate server", 'alert'))
    );
  };

  public updateProduct() {
    this.subscriptions.add(
      this.storeService.updateExistingProduct(this.prodFormData).subscribe(product => {
        if (product.hasOwnProperty('hasError')) {
          //error
          this.facadeService.openSnackBar(product.hasError, 'alert');
        } else {
          /// everything went ok
          this.successfulChangeEmitter.emit([this.categorySelectNum,product]);
          this.facadeService.openSnackBar(`${product.name} has been updated!`, 'success');
        };
      }, err => this.facadeService.openSnackBar("couldn't communicate server", 'alert'))
    );
  };

}
