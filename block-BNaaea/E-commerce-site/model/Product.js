var mongoose=require('mongoose')
var Schema=mongoose.Schema

var ProductSchema=new Schema({
    productName:{type:String,required:true},
    quantity:{type:Number,default:0},
    price:Number,
    image:String,
    category:String,
    likes:{type:Number,default:0},
    dislikes:{type:Number,default:0},
    userId:{type:Schema.Types.ObjectId,ref:'User'}
},{
    timestamps:true
})

module.exports=mongoose.model('Product',ProductSchema)