var express = require('express');
var router = express.Router();
const Product = require('../models/product.model');
const Cart = require('../models/cart.model');
const CartProduct = require('../models/cartProduct.model');
const Category = require('../models/category.model');
const Order = require('../models/order.model');
const localFunctions = require('../local_functions/local.functions');

// if ?id=fsdgfhft , filter products by category. else => get all categories
router.get('/category', function (req, res) {
    if (req.query.id) {
        // respsone --Products-- by category
        Product.find({ category: req.query.id })
            .populate('category', 'name')
            .then(products => {
                res.json(products)
            })
            .catch(err => res.json({ hasError: `Couldn't communicate server, please try again later.` }))
    } else {
        // return all categories
        Category.find({}).then(categories => res.json(categories))
            .catch(err => res.json({ hasError: `Couldn't communicate server, please try again later.` }))
    };
});

// new category
router.post('/category', function (req, res) {
    new Category(req.body).save()
        .then(category => res.json(category))
        .catch(err => res.json({ hasError: `Couldn't communicate server, please try again later.` }))
});

// new product
router.post('/product', function (req, res) {
    if (req.files.file) {
        req.body.price = parseFloat(req.body.price);
        new Product(req.body).save()
            .then(async product => {
                await uploadProductImage(req, product.id);
                return product;
            })
            .then(product => {
                let newCD = `resources/uploads/products/${product.id}.jpg`;
                Product.update({ _id: product.id },
                    { image: newCD },
                    function (err, affected, resp) {
                        if (err)
                            res.json({ hasError: `Couldn't Upload Image` });
                        product.image = newCD;
                        res.json(product);
                    });
            })
            .catch(err => {
                res.json({ hasError: `Couldn't add Product please try again later.` });
            });
    } else {
        res.json({ hasError: `Couldn't upload image, therefore product hasn't been added.` });
    };
});

// update product
router.put('/product', function (req, res) {
    let file = false;
    let id = req.body._id;
    if (req.files && req.files.file) {
        file = true;
    };
    Product.findByIdAndUpdate(id,
        {
            name: req.body.name,
            price: parseFloat(req.body.price),
            category: req.body.category
        })
        .then(async product => {
            if (file) {
                await uploadProductImage(req, product.id);
                res.json(product);
            } else {
                res.json(product);
            };
        })
        .catch(err => {
            res.json({ hasError: `Couldn't update Product please try again later.` });
        });
});

router.get('/product/filter', function (req, res) {
    // filter all products via name LIKE
    Product.find({ name: new RegExp(req.query.name, "gi") }, function (err, data) {
        if (err)
            res.json({ hasError: `Couldn't communicate server, please try again later.` })
        return data;
    })
        .populate('category', 'name')
        .then(products => {
            res.json(products);
        })
        .catch(err => res.json({ hasError: `Couldn't communicate server, please try again later.` }))
});

router.post('/cart', async function (req, res) {
    // check if that's an existing cart or a new user cart - in case it is an existing one..
    // clean related cart Products
    if (req.body._id.length > 0) {
        try {
            // existing cart, remove former cartProduct
            let cart = await Cart.findById(req.body._id)
            // find all cartProducts related, and than remove all of them.
            if (cart.cartProducts.length > 0) {
                for (let i = 0; i < cart.cartProducts.length; i++) {
                    const cartProduct = cart.cartProducts[i];
                    await CartProduct.findByIdAndRemove(cartProduct);
                }
            };
        } catch (e) {
            res.status(400).json({ hasError: `Couldn't communicate server, please try again later.` });
        }
    };
    /// insert new cart products and return cart to req = res
    insertNewCartProductsAndReturnCart(req, res);
});

router.post('/order', function (req, res) {
    // getting cartProducts id's to array for future populating
    let cartProductsObjectIds = [];
    for (let index = 0; index < req.body.cartProducts.length; index++) {
        const cartProd = req.body.cartProducts[index];
        cartProductsObjectIds.push(cartProd._id);
    };
    let order = { ...req.body };
    order.cartProducts = cartProductsObjectIds;
    new Order(order).save()
        .then(order => {
            // everything went ok. clean user cart
            cleanUserCart(req, res, order);
        })
        .catch(err => {
            /// send to error loger and
            res.status(400).json({ hasError: `Couldn't communicate server, please try again later.` });
        });
});

// get all orders shipping dates
router.get('/order/shipping-dates', function (req, res) {
    Order.find({})
        .then(orders => {
            let ordersDatesToSend = [];
            for (let i = 0; i < orders.length; i++) {
                if(new Date() < new Date(orders[i].shippingDate)){
                    // only future orders and in [yyyy/mm/dd] format
                    ordersDatesToSend.push(localFunctions.formatDateToArr(orders[i].shippingDate));
                };
            };
            res.json(ordersDatesToSend);
        })
        .catch(err => {
            /// send to error loger and
            res.status(400).json({ hasError: `Couldn't communicate server, please try again later.` })
        });
});

function cleanUserCart(req, res, order) {
    Cart.find({ user: req.body.user })
        .then(async cart => {
            if (cart.length > 0) {
                // clean it
                await Cart.findByIdAndUpdate(cart[0].id, {
                    cartProducts: []
                });
            };
        })
        .then(cart => {
            res.json(order);
        })
        .catch(err => {
            /// send to error loger and
            res.status(400).json({ hasError: `Couldn't communicate server, please try again later.` })
        });
};

function uploadProductImage(req, productId) {
    return new Promise(resolve => {
        let sampleFile = req.files.file;
        sampleFile.mv(`./build/resources/uploads/products/${productId}.jpg`, function (err) {
            if (err)
                setTimeout(() => resolve(false), 0);
            setTimeout(() => resolve(true), 0);
        });
    });
};

async function insertNewCartProductsAndReturnCart(req, res) {
    try {
        // create new cart products
        await createNewCartProducts(req, res);
        // populate cart
        let cart = await localFunctions.populateCart({ _id: req.body.user }, res)
            .then(cart => {
                res.json(cart);
            })
    } catch (e) {
        res.status(400).json({ hasError: `Couldn't communicate server, please try again later.` });
    };
};

function createNewCartProducts(req, res) {
    return new Promise(async resolve => {
        let cartProducts = [];
        for (let i = 0; i < req.body.cartProducts.length; i++) {
            try {
                const cartProductDummy = req.body.cartProducts[i];
                let cartProd = new CartProduct({
                    product: cartProductDummy.product._id,
                    quantity: cartProductDummy.quantity
                });
                let addedProd = await cartProd.save();
                cartProducts.push(addedProd.id);
            } catch (e) {
                res.status(400).json({ hasError: `Couldn't communicate server, please try again later.` });
            };
        };
        /// insert new cart products
        Cart.find({ user: req.body.user })
            .then(async cart => {
                if (cart.length > 0) {
                    // update it - existing cart
                    await Cart.findByIdAndUpdate(cart[0]._id, {
                        cartProducts: cartProducts,
                        updatedAt: req.body.updatedAt
                    });
                } else {
                    // create new cart -- fake id until now - new customer
                    delete req.body._id;
                    var cart = new Cart({
                        cartProducts: cartProducts,
                        updatedAt: req.body.updatedAt,
                        user: req.body.user
                    });
                    await cart.save()
                };
                resolve(cart);
            })
            .catch(err => {
                /// send to error loger and
                res.status(400).json({ hasError: `Couldn't communicate server, please try again later.` })
            });
    });
};

module.exports = router;