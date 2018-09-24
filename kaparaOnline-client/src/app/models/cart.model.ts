import { CartProductModel } from "./cartProduct.model";

export class CartModel {
    public _id: string;
    public updatedAt: Date;
    public cartProducts: CartProductModel[];
    public user: number; //id

    constructor(_id: string, updatedAt: Date, cartProducts: CartProductModel[], user: number) {
        this._id = _id;
        this.updatedAt = updatedAt;
        this.cartProducts = cartProducts;
        this.user = user;
    };
};