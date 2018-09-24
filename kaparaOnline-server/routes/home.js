var express = require('express');
var router = express.Router();
const Product = require('../models/product.model');
const Order = require('../models/order.model');
const localFunctions = require('../local_functions/local.functions');

router.get('/init', function (req, res) {
    let resume = new Object();
    Product.countDocuments({})
        .then(number => {
            resume.products = number;
            let chosenProductImageNum = localFunctions.randomWithRange(0, number - 1);
            resume.chosenProductImageNum = chosenProductImageNum;
            return resume;
        })
        .then(resume => {
            Order.countDocuments({})
                .then(number => {
                    resume.orders = number;
                    return resume;
                })
                .then(async (resume) => {
                    let chosenImage = await getChosenImage(resume.chosenProductImageNum);
                    delete resume.chosenProductImageNum;
                    resume.chosenImage = chosenImage;
                    res.json(resume);
                })
        })
        .catch(err => {
            res.json({ hasError: `Couldn't communicate server, please try again later.` });
        });
});

function getChosenImage(chosenProductImageNum) {
    return new Promise((resolve) => {
        Product.find({})
            .then(products => {
                // it's an array so..
                let chosenImagePath = products[chosenProductImageNum].image;
                resolve(chosenImagePath);
            })
            .catch(err => {
                res.json({ hasError: `Couldn't communicate server, please try again later.` });
            });
    });
};

module.exports = router;