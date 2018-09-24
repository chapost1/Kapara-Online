import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CartModel } from '../../../models/cart.model';
import { OrderModel } from '../../../models/order.model';

const jsonHeaders = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
}
const HttpUploadHeaders = new HttpHeaders();
HttpUploadHeaders.append('Content-Type', "multipart/form-data");
HttpUploadHeaders.append('Accept', 'application/json');
HttpUploadHeaders.append('enctype', 'application/x-www-form-urlencoded');
const HttpUploadOptions = { headers: HttpUploadHeaders };

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private base: string = 'store';

  constructor(private http: HttpClient) { }
  
  public handleHomeInit(): Observable<any> {
    return this.http.get(`home/init`);
  };

  public getAllCategories(): Observable<any> {
    return this.http.get<any>(`${this.base}/category`);
  };

  public getCategoryProducts(categoryID: string): Observable<any> {
    return this.http.get<any>(`${this.base}/category` , {
      params: {
        id: categoryID
      }
    });
  };

  public addNewProduct(prod: FormData): Observable<any> {
    return this.http.post<any>(`${this.base}/product`, prod, HttpUploadOptions);
  };

  public updateExistingProduct(prod: FormData): Observable<any> {
    return this.http.put<any>(`${this.base}/product`, prod, HttpUploadOptions);
  };

  public getProductsViaName(searchKey: string): Observable<any> {
    return this.http.get<any>(`${this.base}/product/filter`, {
      params: {
        name: searchKey
      }
    });
  };

  public updateUserCart(cart: CartModel): Observable<any> {
    return this.http.post(`${this.base}/cart`, cart, jsonHeaders);
  };

  public getShippingDates(): Observable<any> {
    return this.http.get(`${this.base}/order/shipping-dates`);
  };

  public postUserOrder(order: OrderModel): Observable<any> {
    return this.http.post(`${this.base}/order`, order, jsonHeaders);
  };
}
