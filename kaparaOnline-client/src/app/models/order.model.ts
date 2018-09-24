import { CartProductModel } from "./cartProduct.model";
import { CartModel } from "./cart.model";

export class OrderModel extends CartModel {
    public city: string;
    public address: string;
    public total: number;
    public shippingDate: Date;
    public last4Digits: string;

    constructor(_id: string, updatedAt: Date, cartProducts: CartProductModel[], user: number,
        city: string, address: string, total: number, shippingDate: Date, last4Digits: string) {
        super(_id, updatedAt, cartProducts, user);
        this.city = city;
        this.address = address;
        this.total = total;
        this.shippingDate = shippingDate;
        this.last4Digits = last4Digits;
    };
};