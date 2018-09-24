var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Order = new Schema({
    updatedAt: Date,
    city: String,
    address: String,
    user: { type: Schema.Types.String, ref: 'User' },
    cartProducts: [
        { type: Schema.Types.ObjectId, ref: 'CartProduct' }
    ],
    total: Number,
    shippingDate: Date,
    last4Digits: String
});
module.exports = mongoose.model('Order', Order);