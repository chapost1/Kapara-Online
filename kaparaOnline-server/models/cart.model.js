var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Cart = new Schema({
    updatedAt: Date,
    cartProducts: [
        { type: Schema.Types.ObjectId, ref: 'CartProduct' }
],
    user: { type: Schema.Types.String, ref: 'User' }
});
module.exports = mongoose.model('Cart', Cart);