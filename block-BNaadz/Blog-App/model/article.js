var mongoose=require('mongoose')
var Schema=mongoose.Schema

var articleSchema=new Schema({
    title:{type:String,required:true},
    description:{type:String,required:true},
    tags:[String],
    author:{type:Schema.Types.ObjectId,ref:'User'},
    likes:{type:Number,default:0},
    dislikes:{type:Number,default:0},
    comments:[{type:Schema.Types.ObjectId,ref:'Comment'}],
   
},{
    timestamps:true
})

module.exports=mongoose.model('article',articleSchema)