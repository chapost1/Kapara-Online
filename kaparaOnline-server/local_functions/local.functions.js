const Cart = require('../models/cart.model');
const CartProduct = require('../models/cartProduct.model');
const Product = require('../models/product.model');

module.exports = {
    populateCart: function (user, res) {
        return new Promise(async resolve => {
            try {
                let cart = await Cart.findOne({ user: user._id })
                    .populate('cartProducts', 'product quantity')
                if (cart) {
                    let populatedCartProducts = [];
                    for (let i = 0; i < cart.cartProducts.length; i++) {
                        const cartProduct = cart.cartProducts[i];
                        let populatedCartProduct = await CartProduct.findById(cartProduct.id)
                            .populate('product', 'name price image category');
                        let popuplatedProduct = await Product.findById(populatedCartProduct.product.id)
                            .populate('category', 'name');
                        populatedCartProduct.product = popuplatedProduct;
                        populatedCartProducts.push(populatedCartProduct);
                    };
                    cart.cartProducts = populatedCartProducts;
                };
                resolve(cart);
            } catch (e) {
                res.json({ hasError: `Couldn't log in, please try again later.` });
            };
        })
    },
    randomWithRange: function (min, max) {
        let range = (max - min) + 1;
        return Math.floor(Math.random() * range) + min;
    },
    formatDateToArr: function (date) {
        let arr = [date.getFullYear(), date.getMonth() % 12 + 1, date.getDate()];
        return arr;
    }
};