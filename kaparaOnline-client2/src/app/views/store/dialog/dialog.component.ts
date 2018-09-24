import { Component, Inject, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FacadeService } from '../../../facade_service/facade.service';
import { quantityLowAnimation } from '../../../shared/animations/animations';
import { Subscription } from 'rxjs';
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';

export interface DialogData {
  state: string;
  response: any;
};

/**
 * @title Dialog Overview
 */
@Component({
  selector: 'store-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css'],
})
export class DialogComponent implements OnDestroy {
  private subsciptions = new Subscription();

  constructor(public dialog: MatDialog,
    public facadeService: FacadeService) { }

  ngOnDestroy() {
    this.subsciptions.unsubscribe();
  };

  public openQuantityDialog(): void {
    const dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
      width: '250px',
      data: { state: 'quantity' },
      autoFocus: false,
    });
    this.subsciptions.add(
      dialogRef.afterClosed().subscribe(result => {
      })
    );
  };

  public openSuccessfulOrderDialog(response): void {
    const dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
      width: '350px',
      height: '150px',
      data: { state: 'order', response: response },
      autoFocus: false,
      disableClose: true
    });
    this.subsciptions.add(
      dialogRef.afterClosed().subscribe(result => {
        // order dialog close,
        // clean everything we need;
        this.facadeService.resetStoreAfterSuccessfulPurchaseHandler();
      })
    );
  };

  public openCleanCartDialog(clientCartComponent): void {
    const dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
      width: '250px',
      data: { state: 'cleanCart', response: clientCartComponent },
      autoFocus: false,
    });
    this.subsciptions.add(
      dialogRef.afterClosed().subscribe(result => {
        // order dialog close
      })
    );
  };

};

@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: './dialog-product-toggle.component.html',
  animations: quantityLowAnimation
})
export class DialogOverviewExampleDialog implements OnInit, AfterViewInit {
  public quantity: number = 1;
  public quantityLowAnimationState: string = 'unchecked';
  public state: string;
  public response: any;
  public pdf: any;

  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    public facadeService: FacadeService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
    this.state = data.state;
    this.response = data.response;
  };

  onNoClick(): void {
    this.dialogRef.close();
  };

  ngOnInit() {
    if (this.state == 'order') {
      this.captureScreen();
    };
  };

  ngAfterViewInit() {
    if (this.state == 'quantity') {
      let quantityInput = document.getElementById('input-dialog');
      setTimeout(() => {
        quantityInput.focus();
      }, 0);
    };
  };

  public handleQuantity(state: boolean) {
    if (state)
      this.quantity++;
    else if (!state && this.quantity > 1)
      this.quantity--;
    else {
      this.quantityLowAnimationState = "invalid";
    };
    setTimeout(() => this.quantityLowAnimationState = "unchecked", 250);
  };

  public AddCartProduct() {
    let component = this;
    this.quantityLowAnimationState = "completed";
    setTimeout(() => {
      component.dialogRef.close();
      component.facadeService.addProductToCartHandle(component.quantity);
    }, 0);
  };

  public captureScreen() {
    var data = document.getElementById('contentToConvertToCanvas');
    if (data !== undefined) {
      this.response.cartComponent.cartTableClass = '';
      this.response.cartComponent.cdRef.detectChanges();
      let that = this;
      setTimeout(() => {
        html2canvas(data).then(canvas => {
          // Few necessary setting options  
          var imgWidth = 150;
          var pageHeight = 212;
          var imgHeight = canvas.height * imgWidth / canvas.width;
          var heightLeft = imgHeight;
          const contentDataURL = canvas.toDataURL('image/png');
          let pdf = new jspdf('p', 'mm', 'a5'); // A5 size page of PDF  
          var position = 0;
          pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
          if (heightLeft > 1) {
            while (heightLeft >= 0) {
              position = heightLeft - imgHeight;
              pdf.addPage();
              pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
              heightLeft -= pageHeight;
            };
          };
          that.pdf = pdf;
          that.response.cartComponent.cartTableClass = 'cart-table-container';
          this.response.cartComponent.cdRef.detectChanges();
        });
      }, 0);
    };
  };

  public downloadPdf() {
    this.pdf.save(`${this.response.responseId}.pdf`); // Generated PDF   
  };

  public removeCart() {
    if (this.state == 'cleanCart') {
      // cart comp show
      this.response.cleanCart();
      this.onNoClick();
    };
  };
}