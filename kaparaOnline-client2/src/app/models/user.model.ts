export class UserModel {
    public _id: number;
    public first: string;
    public last: string;
    public username: string;
    public password: string;
    public city: string;
    public address: string;
    public role: string;
    public cart: any; //CartModel
    public orders: any[]; //OrderModel

    constructor(_id: number, first: string, last: string, username: string, city: string,
        address: string, role: string, cart?: any[], orders?: any[], password?: string) {
        this._id = _id;
        this.first = first;
        this.last = last;
        this.username = username;
        this.city = city;
        this.address = address;
        this.role = role;
        this.cart = cart;
        this.orders = orders;
        this.password = password;
    };
}