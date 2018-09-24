import { CategoryModel } from "./category.model";

export class ProductModel {
    public _id: string;
    public name: string;
    public price: number;
    public image: string;
    public category: CategoryModel;

    constructor(_id: string, name: string, price: number, image: string, category: CategoryModel) {
        this._id = _id;
        this.name = name;
        this.price = price;
        this.image = image;
        this.category = category;
    };
};