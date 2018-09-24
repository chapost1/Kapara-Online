var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Product = new Schema({
    name:String,
    price:Number,
    image:String,
    category: { type: Schema.Types.ObjectId, ref: 'Category' }
});
module.exports = mongoose.model('Product', Product);