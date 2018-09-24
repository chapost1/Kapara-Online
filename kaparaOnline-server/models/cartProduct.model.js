var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CartProduct = new Schema({
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    quantity:Number
});
module.exports = mongoose.model('CartProduct', CartProduct);